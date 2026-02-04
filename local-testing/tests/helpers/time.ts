// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Time Manipulation Helpers
 * For testing time-dependent features like cooldowns
 */
import { Simnet } from '@stacks/clarinet-sdk';

/**
 * Advance simnet by mining empty blocks
 * Each block advances approximately 10 seconds
 */
export function advanceBlocks(simnet: Simnet, blocks: number) {
  for (let i = 0; i < blocks; i++) {
    simnet.mineEmptyBlock();
  }
}

/**
 * Advance simnet time by approximately the specified seconds
 * Note: This is approximate since we can only mine blocks
 */
export function advanceTime(simnet: Simnet, seconds: number) {
  // Each block is approximately 10 seconds
  const blocksNeeded = Math.ceil(seconds / 10);
  advanceBlocks(simnet, blocksNeeded);
}

/**
 * Advance past the standard cooldown period (3 days = 259200 seconds)
 */
export function advancePastCooldown(simnet: Simnet) {
  advanceTime(simnet, 259_200 + 100);
}

/**
 * Advance past express cooldown (4 hours = 14400 seconds)
 */
export function advancePastExpressCooldown(simnet: Simnet) {
  advanceTime(simnet, 14_400 + 100);
}

/**
 * Advance past update window (23h 59m = 86340 seconds)
 */
export function advancePastUpdateWindow(simnet: Simnet) {
  advanceTime(simnet, 86_340 + 100);
}

/**
 * Advance past express window (1 day = 86400 seconds)
 */
export function advancePastExpressWindow(simnet: Simnet) {
  advanceTime(simnet, 86_400 + 100);
}
