// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Vault Contract Tests
 * Tests for vault-v1.clar - deposit and redeem operations
 *
 * Contract: contracts/hbtc/protocol/vault-v1.clar
 *
 * Key concepts for bounty hunters:
 * - Deposit: User deposits sBTC -> receives hBTC shares
 * - Redeem: Multi-step process (request -> fund -> redeem)
 * - First depositor gets 1:1 share ratio
 * - Share price = (net-assets × 10^8) / total-supply
 * - Standard cooldown: 3 days, Express cooldown: 4 hours
 * - Exit fee is applied at redemption time
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
  vault,
  state,
  hbtcToken,
  deployer,
  manager,
  user1,
  user2,
  ONE_BTC,
  SHARE_BASE,
  ERR,
  txOk,
  txErr,
  rov,
  initProtocol,
  mineBlocks,
} from '../helpers/setup.js';

// Initialize protocol before each test (simnet resets between tests)
beforeEach(() => {
  initProtocol();
});

// Helper to advance past standard cooldown (3 days = 259200s, ~523s/block in simnet)
function advancePastCooldown() {
  mineBlocks(500);
}

// Helper to advance past express cooldown (4 hours = 14400s, ~523s/block in simnet)
function advancePastExpressCooldown() {
  mineBlocks(30);
}

describe('Vault Contract', () => {
  describe('Deposit', () => {
    describe('Happy Path', () => {
      it('should allow first deposit at 1:1 share ratio', () => {
        // When total supply is 0, shares received equals assets deposited
        const depositAmount = ONE_BTC;

        // Call deposit function using txOk (expects success)
        const result = txOk(vault.deposit(depositAmount, null), user1);

        // First deposit should return shares equal to deposit amount
        expect(result.value).toBe(depositAmount);
      });

      it('should mint hBTC shares to depositor', () => {
        const depositAmount = ONE_BTC;

        // Perform deposit
        txOk(vault.deposit(depositAmount, null), user1);

        // Check hBTC balance using rov (read-only view)
        const balance = rov(hbtcToken.getBalance(user1));

        // Balance should be greater than 0
        expect(balance.value).toBeGreaterThan(0n);
      });

      it('should update total-assets in state', () => {
        const depositAmount = ONE_BTC;

        // Get initial total assets
        const initialAssets = rov(state.getTotalAssets());

        // Perform deposit
        txOk(vault.deposit(depositAmount, null), user1);

        // Get final total assets
        const finalAssets = rov(state.getTotalAssets());

        // Total assets should increase
        expect(finalAssets).toBeGreaterThan(initialAssets);
      });
    });

    describe('Share Price Calculations', () => {
      it('preview-deposit should return share calculation', () => {
        const depositAmount = ONE_BTC;

        // Call preview-deposit
        const preview = rov(vault.previewDeposit(depositAmount));

        // Should return a valid amount
        expect(preview).toBeGreaterThan(0n);
      });
    });

    describe('Error Cases', () => {
      it('should fail if deposit below minimum (ERR_BELOW_MIN u103002)', () => {
        // Try to deposit very small amount
        const result = txErr(vault.deposit(10n, null), user1);

        // Should fail with ERR_BELOW_MIN
        expect(result.value).toBe(ERR.BELOW_MIN);
      });
    });

    describe('Affiliate Tracking', () => {
      it('should accept affiliate parameter', () => {
        const depositAmount = ONE_BTC;
        const affiliateCode = Uint8Array.from([1, 2, 3, 4]);

        // Deposit with affiliate code
        const result = txOk(vault.deposit(depositAmount, affiliateCode), user1);

        // Should succeed
        expect(result.value).toBeGreaterThan(0n);
      });
    });
  });

  describe('Request Redeem', () => {
    it('should create claim with correct data', () => {
      // Setup: deposit first
      txOk(vault.deposit(ONE_BTC, null), user1);

      const shares = ONE_BTC;

      // Request redeem (is-express = false)
      const result = txOk(vault.requestRedeem(shares, false), user1);

      // Should return claim ID (first claim)
      expect(result.value).toBe(1n);
    });

    it('should transfer shares from user to vault escrow', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Get initial balance
      const initialBalance = rov(hbtcToken.getBalance(user1));

      // Request redeem
      const shares = ONE_BTC / 2n;
      txOk(vault.requestRedeem(shares, false), user1);

      // Get final balance
      const finalBalance = rov(hbtcToken.getBalance(user1));

      // Balance should decrease
      expect(finalBalance.value).toBeLessThan(initialBalance.value);
    });
  });

  describe('Fund Claim', () => {
    it('should allow manager to fund before cooldown', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Manager can fund anytime
      const result = txOk(vault.fundClaim(1n), manager);

      expect(result.value).toBeGreaterThan(0n);
    });

    it('should fail if non-manager calls before cooldown', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Non-manager before cooldown should fail (cooldown is 3 days by default)
      const result = txErr(vault.fundClaim(1n), user1);

      expect(result.value).toBe(ERR.NOT_COOLED_DOWN);
    });

    it('should allow anyone to fund after cooldown', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Wait for cooldown
      advancePastCooldown();

      // Anyone can fund after cooldown
      const result = txOk(vault.fundClaim(1n), user1);

      expect(result.value).toBeGreaterThan(0n);
    });

    it('should fail if already funded', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Fund once
      txOk(vault.fundClaim(1n), manager);

      // Try to fund again
      const result = txErr(vault.fundClaim(1n), manager);

      expect(result.value).toBe(ERR.ALREADY_FUNDED);
    });
  });

  describe('Redeem (Final Step)', () => {
    it('should transfer assets to user on redeem', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);
      txOk(vault.fundClaim(1n), manager);

      // Wait for cooldown (manager can fund early, but user must wait to redeem)
      advancePastCooldown();

      // Redeem
      const result = txOk(vault.redeem(1n), user1);

      expect(result.value).toBeGreaterThan(0n);
    });

    it('should fail if not funded', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Try to redeem without funding
      const result = txErr(vault.redeem(1n), user1);

      expect(result.value).toBe(ERR.NOT_FUNDED);
    });
  });

  describe('Cancel Redeem', () => {
    it('should return shares to user on cancel', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // Cancel redeem
      const result = txOk(vault.cancelRedeem(1n), user1);

      expect(result.value).toBe(ONE_BTC);
    });

    it('should fail if not claim owner', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);

      // user2 tries to cancel user1's claim
      const result = txErr(vault.cancelRedeem(1n), user2);

      expect(result.value).toBe(ERR.NOT_AUTHORIZED);
    });

    it('should fail if already funded', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);
      txOk(vault.requestRedeem(ONE_BTC, false), user1);
      txOk(vault.fundClaim(1n), manager);

      // Try to cancel
      const result = txErr(vault.cancelRedeem(1n), user1);

      expect(result.value).toBe(ERR.ALREADY_FUNDED);
    });

    it('should fail for express claims', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Create express claim
      txOk(vault.requestRedeem(ONE_BTC, true), user1);

      // Try to cancel express claim
      const result = txErr(vault.cancelRedeem(1n), user1);

      expect(result.value).toBe(ERR.NOT_ALLOWED);
    });
  });

  describe('Express Redeem', () => {
    it('should use shorter cooldown (4 hours)', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Request express redeem
      txOk(vault.requestRedeem(ONE_BTC, true), user1);

      // Should be fundable after express cooldown (not 3 days)
      advancePastExpressCooldown();

      const result = txOk(vault.fundClaim(1n), user1);

      expect(result.value).toBeGreaterThan(0n);
    });
  });

  describe('Complete Flow: Deposit -> Request Redeem -> Fund Claim -> Redeem', () => {
    it('should complete full standard redemption flow', () => {
      // Step 1: Deposit sBTC and receive hBTC shares
      const depositAmount = ONE_BTC;
      const depositResult = txOk(vault.deposit(depositAmount, null), user1);
      expect(depositResult.value).toBeGreaterThan(0n);

      // Verify hBTC balance
      const sharesReceived = rov(hbtcToken.getBalance(user1));
      expect(sharesReceived.value).toBeGreaterThan(0n);

      // Step 2: Request redemption (standard cooldown)
      const sharesToRedeem = sharesReceived.value as bigint;
      const claimResult = txOk(vault.requestRedeem(sharesToRedeem, false), user1);
      const claimId = claimResult.value;
      expect(claimId).toBe(1n);

      // Verify shares transferred to escrow
      const balanceAfterRequest = rov(hbtcToken.getBalance(user1));
      expect(balanceAfterRequest.value).toBe(0n);

      // Step 3: Fund the claim (manager can fund early)
      const fundResult = txOk(vault.fundClaim(claimId), manager);
      expect(fundResult.value).toBeGreaterThan(0n);

      // Step 4: Wait for cooldown
      advancePastCooldown();

      // Step 5: Redeem and receive sBTC
      const redeemResult = txOk(vault.redeem(claimId), user1);
      expect(redeemResult.value).toBeGreaterThan(0n);
    });

    it('should complete full express redemption flow', () => {
      // Step 1: Deposit sBTC and receive hBTC shares
      const depositAmount = ONE_BTC;
      txOk(vault.deposit(depositAmount, null), user1);

      const sharesReceived = rov(hbtcToken.getBalance(user1));
      const sharesToRedeem = sharesReceived.value as bigint;

      // Step 2: Request express redemption (shorter cooldown)
      const claimResult = txOk(vault.requestRedeem(sharesToRedeem, true), user1);
      const claimId = claimResult.value;

      // Step 3: Wait for express cooldown (4 hours instead of 3 days)
      advancePastExpressCooldown();

      // Step 4: Fund the claim (anyone can fund after cooldown)
      const fundResult = txOk(vault.fundClaim(claimId), user1);
      expect(fundResult.value).toBeGreaterThan(0n);

      // Step 5: Redeem immediately (already past cooldown)
      const redeemResult = txOk(vault.redeem(claimId), user1);
      expect(redeemResult.value).toBeGreaterThan(0n);
    });

    it('should allow multiple deposits and partial redemptions', () => {
      // Deposit from user1
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Deposit from user2
      txOk(vault.deposit(ONE_BTC / 2n, null), user2);

      // user1 requests partial redemption
      const user1Shares = rov(hbtcToken.getBalance(user1)).value as bigint;
      txOk(vault.requestRedeem(user1Shares / 2n, false), user1);

      // Manager funds the claim
      txOk(vault.fundClaim(1n), manager);

      // Wait and redeem
      advancePastCooldown();
      const redeemResult = txOk(vault.redeem(1n), user1);
      expect(redeemResult.value).toBeGreaterThan(0n);

      // user1 should still have remaining shares
      const remainingShares = rov(hbtcToken.getBalance(user1));
      expect(remainingShares.value).toBeGreaterThan(0n);
    });
  });
});
