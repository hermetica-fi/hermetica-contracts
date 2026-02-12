// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Zest Interface Contract Tests
 * Tests for zest-interface-v1.clar - Zest v2 lending/borrowing operations
 *
 * Contract: contracts/hbtc/protocol/interfaces/zest-interface-v1.clar
 *
 * Key concepts for bounty hunters:
 * - Interface allows hBTC protocol to supply collateral, borrow, and earn yield on Zest v2
 * - Trader role required for all operations
 * - Trading must be enabled and Zest contracts must be registered as externals
 * - Funds flow through reserve contract
 * - Price feeds may be required for collateral operations
 *
 * Main flows tested:
 * - zest-collateral-add: Add collateral to Zest market
 * - zest-collateral-remove: Remove collateral from Zest market
 * - zest-borrow: Borrow assets from Zest market
 * - zest-repay: Repay borrowed assets
 * - zest-deposit: Deposit to Zest vault as LP
 * - zest-redeem: Redeem vault shares
 * - sweep: Recover leftover tokens
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import {
  state,
  deployer,
  trader,
  user1,
  ONE_BTC,
  ERR,
  txOk,
  initProtocol,
  sbtcTokenAddress,
} from '../helpers/setup.js';
import {
  getOraclePriceFeed,
  getSimnetBlockTimestamp,
  vaaToBuffer,
} from '../helpers/oracle.js';

// Zest production mainnet contract addresses
const ZEST_MARKET = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-3-market';
const ZEST_VAULT_SBTC = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc';

/**
 * Initialize Zest interface for testing
 * - Enable trading
 * - Fund reserve with sBTC
 */
function initZestInterface() {
  // Initialize base protocol (sBTC funding, state config)
  initProtocol();

  // Enable trading (required for interface operations)
  txOk(state.setTradingEnabled(true), deployer);

  // Transfer sBTC to reserve (protocol's sBTC holdings for Zest operations)
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
}

describe('Zest Interface Contract', () => {
  beforeEach(() => {
    initZestInterface();
  });

  describe('zest-collateral-add', () => {
    it('should fail if caller is not trader', () => {
      const amount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(amount),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should fail if trading is disabled', () => {
      txOk(state.setTradingEnabled(false), deployer);

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_DISABLED));
    });

    it('should successfully add collateral to Zest market', () => {
      const amount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(amount),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      // Should succeed and return the new total collateral amount
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-collateral-remove', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should successfully remove collateral from Zest market', async () => {
      // Fetch BTC price feed from Pyth using simnet's block time
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));

      // First add collateral (with fresh price feed)
      const amount = ONE_BTC / 100n;
      simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-add',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(amount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Then remove collateral (with fresh price feed)
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-collateral-remove',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(amount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed and return remaining collateral amount
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-borrow', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-borrow',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-borrow',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should successfully borrow from Zest market', async () => {
      // Fetch BTC price feed from Pyth using simnet's block time
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));

      // First add collateral to enable borrowing (with fresh price feed)
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

      // Then borrow against the collateral (with fresh price feed)
      const borrowAmount = ONE_BTC / 100n;
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-borrow',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-repay', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-repay',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.none(),
          Cl.none(),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-repay',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n),
          Cl.none(),
          Cl.none(),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should successfully repay to Zest market', async () => {
      // Fetch BTC price feed from Pyth using simnet's block time
      const timestamp = getSimnetBlockTimestamp();
      const priceFeed = await getOraclePriceFeed(timestamp, 'btc');
      const priceFeedBuffer = Cl.some(Cl.buffer(vaaToBuffer(priceFeed.vaa)));

      // First add collateral (with fresh price feed)
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

      // Then borrow (with fresh price feed)
      const borrowAmount = ONE_BTC / 100n;
      simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-borrow',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Then repay the borrowed amount (with fresh price feed)
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-repay',
        [
          Cl.principal(ZEST_MARKET),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(borrowAmount),
          priceFeedBuffer,
          Cl.none(),
        ],
        trader
      );

      // Should succeed and return the repaid amount
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-deposit', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-deposit',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.uint(0n),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-deposit',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(0n),
          Cl.uint(0n),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should fail if trading is disabled', () => {
      txOk(state.setTradingEnabled(false), deployer);

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-deposit',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(ONE_BTC / 100n),
          Cl.uint(0n),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_DISABLED));
    });

    it('should successfully deposit to Zest vault', () => {
      const amount = ONE_BTC / 100n;

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-deposit',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(amount),
          Cl.uint(0n), // min shares
        ],
        trader
      );

      // Should succeed and return shares received
      expect(result.result.type).toBe('ok');
    });
  });

  describe('zest-redeem', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-redeem',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.uint(ONE_BTC / 100n),
          Cl.uint(0n),
        ],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if shares is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-redeem',
        [Cl.principal(ZEST_VAULT_SBTC), Cl.uint(0n), Cl.uint(0n)],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should fail if trading is disabled', () => {
      txOk(state.setTradingEnabled(false), deployer);

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-redeem',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.uint(ONE_BTC / 100n),
          Cl.uint(0n),
        ],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.TRADING_DISABLED));
    });

    it('should successfully redeem from Zest vault', () => {
      // First deposit to get vault shares
      const depositAmount = ONE_BTC / 100n;
      const depositResult = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-deposit',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.principal(sbtcTokenAddress),
          Cl.uint(depositAmount),
          Cl.uint(0n),
        ],
        trader
      );
      expect(depositResult.result.type).toBe('ok');

      // Get the shares received from deposit
      const sharesReceived = (depositResult.result as any).value.value;

      // Then redeem the shares
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'zest-redeem',
        [
          Cl.principal(ZEST_VAULT_SBTC),
          Cl.uint(sharesReceived),
          Cl.uint(0n), // min amount
        ],
        trader
      );

      // Should succeed and return underlying received
      expect(result.result.type).toBe('ok');
    });
  });

  describe('sweep', () => {
    it('should fail if caller is not trader', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'sweep',
        [Cl.principal(sbtcTokenAddress), Cl.uint(ONE_BTC / 100n)],
        user1 // Not trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.NOT_TRADER));
    });

    it('should fail if amount is zero', () => {
      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'sweep',
        [Cl.principal(sbtcTokenAddress), Cl.uint(0n)],
        trader
      );

      expect(result.result).toBeErr(Cl.uint(ERR.ZEST_INVALID_AMOUNT));
    });

    it('should successfully sweep leftover sBTC to reserve', () => {
      // Transfer some sBTC directly to zest-interface (simulating leftover)
      simnet.callPublicFn(
        sbtcTokenAddress,
        'transfer',
        [
          Cl.uint(ONE_BTC / 1000n), // 0.001 BTC
          Cl.principal(deployer),
          Cl.principal(`${deployer}.zest-interface`),
          Cl.none(),
        ],
        deployer
      );

      const amount = ONE_BTC / 1000n;

      const result = simnet.callPublicFn(
        `${deployer}.zest-interface`,
        'sweep',
        [Cl.principal(sbtcTokenAddress), Cl.uint(amount)],
        trader
      );

      expect(result.result).toBeOk(Cl.uint(amount));
    });
  });
});
