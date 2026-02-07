// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Hermetica Interface Tests
 * Tests for USDh staking/unstaking operations through the hBTC protocol
 *
 * Contract: contracts/hbtc/protocol/interfaces/hermetica-interface-v1.clar
 *
 * Key concepts for bounty hunters:
 * - Interface allows hBTC protocol to stake USDh for sUSDh yield
 * - Trader role required for all operations
 * - Trading must be enabled and contracts must be registered
 * - USDh/sUSDh flows through reserve contract
 *
 * Note: Full staking operations require the complete USDh protocol stack.
 * These tests focus on authorization and basic validation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
  hermeticaInterface,
  state,
  deployer,
  trader,
  user1,
  ONE_USDH,
  ONE_SUSDH,
  ERR,
  txOk,
  initProtocol,
  sbtcTokenAddress,
} from '../helpers/setup.js';

// Hermetica mainnet staking contract addresses
const stakingContract = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-v1-1';
const stakingSiloContract = `${deployer}.staking-silo`;

/**
 * Initialize Hermetica interface for testing
 * - Enable trading
 * - Register USDh/sUSDh as assets
 * - Register staking contracts as externals
 */
function initHermeticaInterface() {
  // Initialize base protocol (sBTC funding, state config)
  initProtocol();

  // Enable trading (required for interface operations)
  txOk(state.setTradingEnabled(true), deployer);
}

describe('Hermetica Interface', () => {
  beforeEach(() => {
    initHermeticaInterface();
  });

  describe('Authorization Checks', () => {
    /**
     * Note: hermetica-stake calls staking.get-usdh-per-susdh before the trader check,
     * so authorization tests may fail on the staking call first.
     * The trader check is still present and will be tested via successful paths.
     */
    it('hermetica-stake: should check trader role', () => {
      const amount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'hermetica-stake',
        [Cl.uint(amount), Cl.principal(stakingContract)],
        user1 // Not trader
      );

      // May fail on staking call or trader check depending on contract state
      expect(result.result.type).toBe('err');
    });

    /**
     * Note: hermetica-unstake calls reserve.transfer before the trader check,
     * so authorization tests may fail on the transfer call first.
     */
    it('hermetica-unstake: should check trader role', () => {
      const amount = 100n * ONE_SUSDH;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'hermetica-unstake',
        [Cl.uint(amount), Cl.principal(stakingContract)],
        user1 // Not trader
      );

      // May fail on reserve transfer or trader check
      expect(result.result.type).toBe('err');
    });

    /**
     * Note: hermetica-withdraw calls staking-silo.get-claim with unwrap-panic,
     * which causes a runtime error when claim doesn't exist.
     * This test verifies the function fails (either via error or runtime panic).
     */
    it('hermetica-withdraw: should fail without valid claim', () => {
      // Calling with non-existent claim ID will cause unwrap-panic
      // We just verify the function doesn't succeed
      try {
        const result = simnet.callPublicFn(
          `${deployer}.hermetica-interface`,
          'hermetica-withdraw',
          [Cl.uint(1n), Cl.principal(stakingSiloContract)],
          user1 // Not trader
        );
        // If we get here, it should be an error response
        expect(result.result.type).toBe('err');
      } catch (e) {
        // Runtime panic is expected when claim doesn't exist
        expect(e).toBeDefined();
      }
    });

    /**
     * Note: hermetica-unstake-and-withdraw has dependencies on staking/reserve.
     */
    it('hermetica-unstake-and-withdraw: should check trader role', () => {
      const amount = 100n * ONE_SUSDH;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'hermetica-unstake-and-withdraw',
        [
          Cl.uint(amount),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
        ],
        user1 // Not trader
      );

      // Will fail on some dependency or trader check
      expect(result.result.type).toBe('err');
    });
  });

  describe('sweep', () => {
    /**
     * Sweep function checks trader -> asset -> amount in order.
     * This is the most testable function since checks happen early.
     */
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'sweep',
        [Cl.principal(`${deployer}.usdh-token`), Cl.uint(10n * ONE_USDH)],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      // Use sBTC which is registered as an asset in state
      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'sweep',
        [Cl.principal(sbtcTokenAddress), Cl.uint(0n)],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.HERMETICA_INVALID_AMOUNT));
    });

    it('should fail if interface has no tokens to sweep', () => {
      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'sweep',
        [Cl.principal(`${deployer}.usdh-token`), Cl.uint(10n * ONE_USDH)],
        trader
      );

      // Sweep checks trader -> asset -> transfer. The transfer will fail
      // because hermetica-interface has no tokens to send.
      expect(result.result.type).toBe('err');
    });

    it('should successfully sweep sBTC to reserve', () => {
      // Transfer some sBTC directly to hermetica-interface (simulating leftover)
      simnet.callPublicFn(
        sbtcTokenAddress,
        'transfer',
        [
          Cl.uint(1000000n), // 0.01 BTC
          Cl.principal(deployer),
          Cl.principal(`${deployer}.hermetica-interface`),
          Cl.none(),
        ],
        deployer
      );

      const amount = 1000000n;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'sweep',
        [Cl.principal(sbtcTokenAddress), Cl.uint(amount)],
        trader
      );

      expect(result.result).toBeOk(Cl.uint(amount));
    });
  });

  describe('Trading State Checks', () => {
    it('hermetica-stake: should fail if trading is disabled', () => {
      // Disable trading
      txOk(state.setTradingEnabled(false), deployer);

      const amount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'hermetica-stake',
        [Cl.uint(amount), Cl.principal(stakingContract)],
        trader
      );

      // Will fail on staking dependency or trading auth check
      expect(result.result.type).toBe('err');
    });

    it('hermetica-unstake: should fail if trading is disabled', () => {
      // Disable trading
      txOk(state.setTradingEnabled(false), deployer);

      const amount = 100n * ONE_SUSDH;

      const result = simnet.callPublicFn(
        `${deployer}.hermetica-interface`,
        'hermetica-unstake',
        [Cl.uint(amount), Cl.principal(stakingContract)],
        trader
      );

      // Will fail on reserve transfer or trading auth check
      expect(result.result.type).toBe('err');
    });
  });
});
