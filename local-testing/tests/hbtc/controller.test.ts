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
import {
  vault,
  state,
  controllerHbtc,
  deployer,
  rewarder,
  user1,
  ONE_BTC,
  SHARE_BASE,
  BPS_BASE,
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

// Helper to advance past update window (~24 hours = ~8640 blocks at 10s/block)
function advancePastUpdateWindow() {
  mineBlocks(8700);
}

describe('Controller Contract', () => {
  describe('Log Reward - Authorization & Access Control', () => {
    it('should fail if not called by rewarder (ERR_NOT_REWARDER u101006)', () => {
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
  });
});
