// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Trading Contract Tests
 * Tests for trading-v1.clar - Combined DeFi position management flows
 *
 * Contract: contracts/hbtc/protocol/trading-v1.clar
 *
 * Key concepts for bounty hunters:
 * - Trading contract combines multiple interface operations atomically
 * - Trader role required for all operations
 * - Trading must be enabled
 * - Flows involve: Zest (collateral/borrow) + Hermetica (stake/unstake)
 *
 * Main flows tested:
 * - zest-add-open: Add collateral -> Borrow -> Stake
 * - zest-close-remove: Unstake -> Repay -> Remove collateral
 * - zest-open: Borrow -> Stake (without adding collateral)
 * - zest-close: Unstake -> Repay (without removing collateral)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
  state,
  deployer,
  trader,
  rewarder,
  user1,
  ONE_BTC,
  ONE_USDH,
  ERR,
  txOk,
  initProtocol,
  sbtcTokenAddress,
} from '../helpers/setup.js';
import {
  getOraclePriceFeed,
  getSimnetBlockTimestamp,
  vaaToBuffer,
  updateDiaOracle,
} from '../helpers/oracle.js';

// Zest mainnet contract addresses
const ZEST_MARKET = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-3-market';
const ZEST_VAULT_SBTC = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc';

// Hermetica mainnet staking contract addresses
const stakingContract = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-v1-1';
const stakingSiloContract = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-v1-1';
const usdhToken = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1';
const vaultContract = `${deployer}.vault`;

// Mainnet staking-state admin wallet
const stakingStateAdmin = 'SM1QXYXZG78DCWJZJKY0901KTK3350071W9YYRPMT';

/**
 * Initialize trading for testing
 * - Enable trading
 * - Fund reserve with sBTC
 * - Set custom cooldown for hermetica-interface on mainnet staking-state
 */
function initTrading() {
  // Initialize base protocol (sBTC funding, state config)
  initProtocol();

  // Enable trading (required for trading operations)
  txOk(state.setTradingEnabled(true), deployer);

  // Transfer sBTC to reserve (protocol's sBTC holdings for operations)
  simnet.callPublicFn(
    sbtcTokenAddress,
    'transfer',
    [
      Cl.uint(10n * ONE_BTC),
      Cl.principal(deployer),
      Cl.principal(`${deployer}.reserve`),
      Cl.none(),
    ],
    deployer
  );

  // Set custom cooldown of 0 for hermetica-interface on mainnet staking-state
  // This enables instant withdrawal for testing the close flows
  simnet.callPublicFn(
    'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-state-v1',
    'set-custom-cooldown',
    [
      Cl.principal(`${deployer}.hermetica-interface`),
      Cl.uint(0),
    ],
    stakingStateAdmin
  );
}

describe('Trading Contract', () => {
  beforeEach(() => {
    initTrading();
  });

  describe('zest-add-open (Add Collateral -> Borrow -> Stake)', () => {
    it('should fail if caller is not trader', () => {
      const collateralAmount = ONE_BTC / 100n;
      const borrowAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(collateralAmount),
          Cl.uint(borrowAmount),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if collateral amount is zero', () => {
      const borrowAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(0n), // Zero collateral
          Cl.uint(borrowAmount),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should fail if borrow amount is zero', () => {
      const collateralAmount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(collateralAmount),
          Cl.uint(0n), // Zero borrow
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should successfully add collateral, borrow and stake', async () => {
      // Fetch BTC price feed from Pyth using simnet's block time
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));

      // Update DIA oracle for USDh/USD price (required by Zest market)
      updateDiaOracle(timestamp);

      const collateralAmount = ONE_BTC / 100n;
      const borrowAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(collateralAmount),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed with the full flow
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-close-remove (Unstake -> Repay -> Remove Collateral)', () => {
    it('should fail if caller is not trader', () => {
      const unstakeAmount = 100n * ONE_USDH;
      const collateralAmount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(vaultContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(unstakeAmount),
          Cl.uint(collateralAmount),
          Cl.list([]), // Empty claim IDs
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if unstake amount is zero', () => {
      const collateralAmount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(vaultContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(0n), // Zero unstake
          Cl.uint(collateralAmount),
          Cl.list([]),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should fail if collateral amount is zero', () => {
      const unstakeAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(vaultContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(unstakeAmount),
          Cl.uint(0n), // Zero collateral
          Cl.list([]),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should successfully unstake, repay and remove collateral', async () => {
      // Step 1: Open a position first (add collateral, borrow, stake)
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));
      updateDiaOracle(timestamp);

      const collateralAmount = ONE_BTC / 10n; // 0.1 BTC collateral
      const borrowAmount = 100n * ONE_USDH; // 100 USDh borrow

      // Open position via zest-add-open
      const openResult = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(collateralAmount),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );
      expect(openResult.result.type).toBe('ok');

      // Step 2: Close position (unstake, repay, remove collateral)
      // Calculate sUSDh amount based on the ratio (~1.21 USDh per sUSDh)
      const susdh_RATIO = 121134825n;
      const USDH_BASE = 100000000n;
      const unstakeAmount = (borrowAmount * USDH_BASE) / susdh_RATIO;

      // Note: We remove most but not ALL collateral because:
      // 1. Interest accrues between borrow and repay
      // 2. Zest doesn't allow removing all collateral if any debt remains
      // In production, an exact repay amount would be calculated
      const collateralToRemove = (collateralAmount * 99n) / 100n; // Remove 99%

      const closeResult = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(vaultContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(unstakeAmount),
          Cl.uint(collateralToRemove), // Remove 99% of collateral
          Cl.list([]), // No claims to fund
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed with the full close-remove flow
      expect(closeResult.result.type).toBe('ok');
    });
  });

  describe('zest-open (Borrow -> Stake)', () => {
    it('should fail if caller is not trader', () => {
      const borrowAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(usdhToken),
          Cl.uint(borrowAmount),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if borrow amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(usdhToken),
          Cl.uint(0n), // Zero borrow
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should successfully borrow and stake', async () => {
      // Fetch BTC price feed from Pyth using simnet's block time
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));

      // Update DIA oracle for USDh/USD price (required by Zest market)
      updateDiaOracle(timestamp);

      // First add collateral via zest-interface to enable borrowing (with price feed)
      const collateralAmount = ONE_BTC / 10n;
      simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(collateralAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Then borrow and stake via trading contract (with price feed)
      const borrowAmount = 100n * ONE_USDH;
      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(usdhToken),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed with the full flow
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-close (Unstake -> Repay)', () => {
    it('should fail if caller is not trader', () => {
      const unstakeAmount = 100n * ONE_USDH;

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(usdhToken),
          Cl.uint(unstakeAmount),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if unstake amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(usdhToken),
          Cl.uint(0n), // Zero unstake
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_INVALID_AMOUNT));
    });

    it('should successfully unstake and repay', async () => {
      // Step 1: Open a position first (add collateral, borrow, stake)
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));
      updateDiaOracle(timestamp);

      const collateralAmount = ONE_BTC / 10n; // 0.1 BTC collateral
      const borrowAmount = 100n * ONE_USDH; // 100 USDh borrow

      // Open position via zest-add-open
      const openResult = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-add-open',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(sbtcTokenAddress),
          Cl.principal(usdhToken),
          Cl.uint(collateralAmount),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );
      expect(openResult.result.type).toBe('ok');

      // Step 2: Close position (unstake and repay)
      // Calculate sUSDh amount based on the ratio (~1.21 USDh per sUSDh)
      const susdh_RATIO = 121134825n; // From mainnet staking ratio
      const USDH_BASE = 100000000n;
      const unstakeAmount = (borrowAmount * USDH_BASE) / susdh_RATIO;

      const closeResult = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-close',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(stakingContract),
          Cl.principal(stakingSiloContract),
          Cl.principal(usdhToken),
          Cl.uint(unstakeAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed with the full close flow
      expect(closeResult.result.type).toBe('ok');
    });
  });

  describe('zest-sweep-and-reward (Sweep + Log Reward)', () => {
    it('should fail if caller is not rewarder', () => {
      // Transfer some sBTC to zest-interface (simulating leftover)
      simnet.callPublicFn(
        sbtcTokenAddress,
        'transfer',
        [
          Cl.uint(ONE_BTC / 1000n),
          Cl.principal(deployer),
          Cl.principal(`${deployer}.zest-interface`),
          Cl.none(),
        ],
        deployer
      );

      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-sweep-and-reward',
        [
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 1000n),
          Cl.uint(100n),
          Cl.bool(true),
        ],
        user1 // Not rewarder
      );

      // Fails on first check: check-is-rewarder
      expect(result.result).toBeErr(Cl.uint(ERR.NOT_REWARDER));
    });

    it('should fail if sweep amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.trading`,
        'zest-sweep-and-reward',
        [
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n), // Zero sweep
          Cl.uint(100n),
          Cl.bool(true),
        ],
        rewarder
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });
  });
});
