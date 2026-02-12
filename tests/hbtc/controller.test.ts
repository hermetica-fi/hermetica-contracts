// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Controller Contract Tests
 * Tests for controller-v1.clar - log-reward and protocol management
 *
 * Contract: contracts/hbtc/protocol/controller-v1.clar
 *
 * Key concepts for bounty hunters:
 * - Only REWARDER role can call log-reward
 * - Positive rewards: allocate perf-fee, mgmt-fee, and reserve fund
 * - Negative rewards (losses): covered by reserve fund first, then price drop
 * - Max reward is capped at 3 bps of total-assets per call
 * - Update window prevents rapid successive calls
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
  vault,
  state,
  controllerHbtc,
  reserveFund,
  deployer,
  rewarder,
  user1,
  ONE_BTC,
  ERR,
  txOk,
  txErr,
  rov,
  initProtocol,
  mineBlocks,
  sbtcTokenAddress,
} from '../helpers/setup.js';

// Initialize protocol before each test (simnet resets between tests)
beforeEach(() => {
  initProtocol();
});

// Helper to advance past update window (~24 hours, ~523s/block in simnet)
function advancePastUpdateWindow() {
  mineBlocks(170);
}

describe('Controller Contract', () => {
  describe('Log Reward - Authorization & Access Control', () => {
    it('should fail if not called by rewarder (ERR_NOT_REWARDER u101005)', () => {
      // First setup initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // Non-rewarder tries to log reward
      const result = txErr(controllerHbtc.logReward(1000n, true), user1);

      expect(result.value).toBe(ERR.NOT_REWARDER);
    });
  });

  describe('Log Reward - Positive Reward (Profit)', () => {
    it('should succeed when called by rewarder with valid reward', () => {
      // Setup: Make initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // Log a small positive reward (must be within 3 bps of total assets)
      const reward = 100n;

      const result = txOk(controllerHbtc.logReward(reward, true), rewarder);

      // Should succeed
      expect(result.value).toBe(true);
    });

    it('should increase total-assets on positive reward', () => {
      // Setup: Make initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Get initial total assets
      const initialAssets = rov(state.getTotalAssets());

      advancePastUpdateWindow();

      // Log a positive reward
      const reward = 1000n;
      txOk(controllerHbtc.logReward(reward, true), rewarder);

      // Get final total assets
      const finalAssets = rov(state.getTotalAssets());

      // Total assets should increase (reward minus fees)
      expect(finalAssets).toBeGreaterThan(initialAssets);
    });
  });

  describe('Log Reward - Negative Reward (Loss)', () => {
    it('should succeed with loss when reserve fund can cover it', () => {
      // Setup: Make initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Fund the reserve fund with sBTC so it can cover losses
      simnet.callPublicFn(
        sbtcTokenAddress,
        'transfer',
        [
          Cl.uint(ONE_BTC / 10n), // 0.1 BTC to reserve fund
          Cl.principal(deployer),
          Cl.principal(`${deployer}.reserve-fund`),
          Cl.none(),
        ],
        deployer
      );

      advancePastUpdateWindow();

      // Log a small loss that can be covered by reserve fund
      const loss = 100n;
      const result = txOk(controllerHbtc.logReward(loss, false), rewarder);

      // Should succeed - the log-reward function completed
      // When reserve fund covers the loss, total-assets may stay the same
      // (loss is absorbed by reserve fund, not from protocol assets)
      expect(result.value).toBe(true);
    });

    it('should succeed with loss when reserve fund cannot fully cover (price drop)', () => {
      // Setup: Make initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Get initial total assets (reserve fund starts empty or small)
      const initialAssets = rov(state.getTotalAssets());

      advancePastUpdateWindow();

      // Log a loss (will cause price drop since reserve fund is empty)
      const loss = 100n;
      const result = txOk(controllerHbtc.logReward(loss, false), rewarder);

      // Should succeed
      expect(result.value).toBe(true);

      // Total assets should decrease (loss applied directly to protocol)
      const finalAssets = rov(state.getTotalAssets());
      expect(finalAssets).toBeLessThan(initialAssets);
    });

    it('should reduce reserve fund balance when covering loss', () => {
      // Setup: Make initial deposit
      txOk(vault.deposit(ONE_BTC, null), user1);

      // Fund the reserve fund
      const reserveFundInitial = ONE_BTC / 10n;
      const reserveFundAddr = `${deployer}.reserve-fund`;
      simnet.callPublicFn(
        sbtcTokenAddress,
        'transfer',
        [
          Cl.uint(reserveFundInitial),
          Cl.principal(deployer),
          Cl.principal(reserveFundAddr),
          Cl.none(),
        ],
        deployer
      );

      // Get reserve fund sBTC balance before loss
      const balanceBefore = simnet.callReadOnlyFn(
        sbtcTokenAddress,
        'get-balance',
        [Cl.principal(reserveFundAddr)],
        deployer
      );

      advancePastUpdateWindow();

      // Log a loss
      const loss = 100n;
      txOk(controllerHbtc.logReward(loss, false), rewarder);

      // Get reserve fund sBTC balance after loss
      const balanceAfter = simnet.callReadOnlyFn(
        sbtcTokenAddress,
        'get-balance',
        [Cl.principal(reserveFundAddr)],
        deployer
      );

      // Reserve fund balance should decrease (used to cover the loss)
      const before = (balanceBefore.result as any).value.value as bigint;
      const after = (balanceAfter.result as any).value.value as bigint;
      expect(after).toBeLessThan(before);
    });
  });

  describe('Log Reward - Rate Limiting', () => {
    it('should fail if called too soon after previous call', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // First call succeeds
      txOk(controllerHbtc.logReward(100n, true), rewarder);

      // Second call without waiting should fail
      const result = txErr(controllerHbtc.logReward(100n, true), rewarder);

      expect(result.value).toBe(ERR.WINDOW_CLOSED);
    });

    it('should succeed after waiting for update window', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // First call succeeds
      txOk(controllerHbtc.logReward(100n, true), rewarder);

      // Wait for update window
      advancePastUpdateWindow();

      // Second call should succeed
      const result = txOk(controllerHbtc.logReward(100n, true), rewarder);
      expect(result.value).toBe(true);
    });
  });

  describe('Log Reward - Edge Cases', () => {
    it('should fail on zero reward with is-positive=false (ERR_ZERO_ONLY_POSITIVE u104001)', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // Zero negative reward is invalid
      const result = txErr(controllerHbtc.logReward(0n, false), rewarder);

      expect(result.value).toBe(ERR.ZERO_ONLY_POSITIVE);
    });

    it('should allow zero reward with is-positive=true (no-op)', () => {
      // Setup
      txOk(vault.deposit(ONE_BTC, null), user1);

      advancePastUpdateWindow();

      // Zero positive reward is valid (useful for resetting window)
      const result = txOk(controllerHbtc.logReward(0n, true), rewarder);

      expect(result.value).toBe(true);
    });
  });
});
