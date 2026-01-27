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
  zestInterface,
  reserve,
  state,
  deployer,
  trader,
  admin,
  user1,
  ONE_BTC,
  ERR,
  txOk,
  txErr,
  rov,
  initProtocol,
  sbtcTokenAddress,
} from '../helpers/setup.js';

// Zest production mainnet contract addresses
const ZEST_MARKET = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-0-market';
const ZEST_VAULT_SBTC = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.vault-sbtc';

/**
 * Initialize Zest interface for testing
 * - Enable trading
 * - Fund reserve with sBTC
 */
function initZestInterface() {
  // Initialize base protocol (sBTC funding, state config)
  initProtocol();

  // Enable trading (required for interface operations)
  txOk(state.setTradingEnabled(true), admin);

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
      txOk(state.setTradingEnabled(false), admin);

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

    it('should pass auth checks and reach Zest market', () => {
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

      // Should pass auth checks (trader, trading enabled, externals registered)
      // May succeed or fail at Zest market level due to mainnet state requirements
      // Key point: NOT failing with NOT_TRADER, NOT_EXTERNAL, or TRADING_DISABLED
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        // Call succeeded - auth checks passed and Zest market accepted the call
        expect(result.result.type).toBe('ok');
      }
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

    it('should pass auth checks and reach Zest market', () => {
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
        trader
      );

      // Should pass auth checks
      // May succeed or fail at Zest market level due to mainnet state requirements
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        expect(result.result.type).toBe('ok');
      }
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

    it('should pass auth checks and reach Zest market', () => {
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
        trader
      );

      // Should pass auth checks
      // May succeed or fail at Zest market level due to mainnet state requirements
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        expect(result.result.type).toBe('ok');
      }
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

    it('should pass auth checks and reach Zest market', () => {
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
        trader
      );

      // Should pass auth checks
      // May succeed or fail at Zest market level due to mainnet state requirements
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        expect(result.result.type).toBe('ok');
      }
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
      txOk(state.setTradingEnabled(false), admin);

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

    it('should pass auth checks and reach Zest vault', () => {
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

      // Should pass auth checks
      // May succeed or fail at Zest vault level due to mainnet state requirements
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        // Call succeeded - auth checks passed and Zest vault accepted the deposit
        expect(result.result.type).toBe('ok');
      }
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
      txOk(state.setTradingEnabled(false), admin);

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

    it('should pass auth checks and reach Zest vault', () => {
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

      // Should pass auth checks
      // May succeed or fail at Zest vault level due to mainnet state requirements
      if (result.result.type === 'err') {
        const errValue = (result.result as any).value.value;
        expect(errValue).not.toBe(ERR.NOT_TRADER);
        expect(errValue).not.toBe(ERR.TRADING_DISABLED);
      } else {
        expect(result.result.type).toBe('ok');
      }
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
