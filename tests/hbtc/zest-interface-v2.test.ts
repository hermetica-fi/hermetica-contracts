// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Zest Interface v2 Contract Tests
 * Tests for zest-interface-v2.clar - Zest v0-8 market collateral and borrowing
 *
 * Contract: mainnet/contracts/hbtc/protocol/interfaces/zest-interface-v2.clar
 *
 * Key concepts for bounty hunters:
 * - Interface lets the hBTC protocol add/remove collateral, borrow and repay on Zest v0-8
 * - Trader role required for all operations
 * - Trading must be enabled; the market and asset must be registered in state
 * - Funds flow through the reserve contract; borrowed and removed assets go to the reserve
 * - Price-sensitive calls forward signed Pyth Lazer updates and pay the oracle fee (max 1 STX)
 *
 * Main flows tested:
 * - zest-collateral-add / zest-collateral-remove
 * - zest-borrow / zest-repay
 * - sweep
 *
 * Runs against the forked mainnet market with recorded Lazer prices (see helpers/zest-v2.ts).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl, ClarityType, cvToValue } from '@stacks/transactions';
import { deployer, trader, user1, state, txOk } from '../helpers/setup.js';
import {
  MARKET,
  ORACLE,
  SBTC,
  USDCX,
  INTERFACE,
  RESERVE,
  C,
  COLLATERAL,
  ERR,
  ok,
  amount,
  rejected,
  balance,
  debt,
  collateral,
  snapshot,
  iface,
  fundToken,
  addCollateral,
  setOracleFee,
  removeAsset,
  removeExternal,
  initZestV2,
  getLazerPriceFeeds,
} from '../helpers/zest-v2.js';

const stxBalance = (owner: string) => simnet.getAssetsMap().get('STX')?.get(owner) ?? 0n;

describe('Zest Interface v2 Contract', () => {
  beforeEach(() => {
    initZestV2();
  });

  describe('authorization and validation', () => {
    for (const fn of ['zest-collateral-add', 'zest-collateral-remove', 'zest-borrow', 'zest-repay']) {
      it(`${fn}: should fail if caller is not trader`, () => {
        const before = snapshot();
        rejected(iface(fn, 1n, Cl.none(), user1), ERR.notTrader);
        expect(snapshot()).toEqual(before);
      });

      it(`${fn}: should fail if amount is zero`, () => {
        const before = snapshot();
        rejected(iface(fn, 0n), ERR.invalidInterfaceAmount);
        expect(snapshot()).toEqual(before);
      });

      it(`${fn}: should fail if the market was removed through governance`, () => {
        removeExternal(MARKET);
        const before = snapshot();
        rejected(iface(fn, 1n), ERR.notExternal);
        expect(snapshot()).toEqual(before);
      });

      it(`${fn}: should fail if the asset was removed through governance`, () => {
        removeAsset(USDCX);
        const before = snapshot();
        rejected(iface(fn, 1n), ERR.notAsset);
        expect(snapshot()).toEqual(before);
      });
    }

    it('should fail if trading is disabled', () => {
      txOk(state.setTradingEnabled(false), deployer);
      const before = snapshot();
      rejected(iface('zest-borrow', C), ERR.tradingDisabled);
      expect(snapshot()).toEqual(before);
    });

    it('should propagate insufficient reserve funding without changing the position', () => {
      fundToken(SBTC, RESERVE, 1n);
      const reserveSbtc = balance(SBTC, RESERVE);
      const before = snapshot();
      rejected(iface('zest-collateral-add', reserveSbtc + 1n, Cl.none(), trader, SBTC), ERR.insufficientReserve);
      expect(snapshot()).toEqual(before);
    });
  });

  describe('zest-collateral-add / zest-collateral-remove', () => {
    it('should add and remove sBTC without an oracle update when no debt exists', () => {
      addCollateral();
      const before = balance(SBTC, RESERVE);
      expect(iface('zest-collateral-remove', COLLATERAL, Cl.none(), trader, SBTC).result).toBeOk(Cl.uint(0));
      expect(collateral()).toBe(0n);
      expect(debt()).toBe(0n);
      expect(balance(SBTC, RESERVE)).toBe(before + COLLATERAL);
    });

    it('should require a price update to remove collateral while debt remains', () => {
      addCollateral();
      ok(iface('zest-borrow', 100n * C, getLazerPriceFeeds()));
      const before = snapshot();
      rejected(iface('zest-collateral-remove', 1_000_000n, Cl.none(), trader, SBTC), ERR.missingPrice);
      expect(snapshot()).toEqual(before);
      expect(iface('zest-collateral-remove', 1_000_000n, getLazerPriceFeeds(), trader, SBTC).result)
        .toBeOk(Cl.uint(COLLATERAL - 1_000_000n));
      expect(collateral()).toBe(COLLATERAL - 1_000_000n);
      expect(balance(SBTC, RESERVE)).toBe(before.reserveSbtc + 1_000_000n);
    });
  });

  describe('zest-borrow', () => {
    it('should fail without a price update and preserve collateral', () => {
      addCollateral();
      const before = snapshot();
      rejected(iface('zest-borrow', C), ERR.missingPrice);
      expect(snapshot()).toEqual(before);
    });

    it('should verify a recorded Lazer update and borrow USDCx to the reserve', () => {
      addCollateral();
      const before = snapshot();
      ok(iface('zest-borrow', 100n * C, getLazerPriceFeeds()));
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx + 100n * C);
      expect(balance(USDCX, INTERFACE)).toBe(before.interfaceUsdcx);
      expect(debt()).toBeGreaterThan(before.debt);
      expect(collateral()).toBe(before.collateral);
    });

    it('should pay the governed oracle fee from the interface STX balance', () => {
      addCollateral();
      const feeResult = simnet.callReadOnlyFn(ORACLE, 'get-fee', [], deployer).result;
      expect(feeResult).toHaveClarityType(ClarityType.UInt);
      const fee = BigInt(cvToValue(feeResult));
      expect(fee).toBeLessThanOrEqual(1_000_000n);
      ok(simnet.transferSTX(2_000_000, INTERFACE, deployer));
      const before = stxBalance(INTERFACE);
      ok(iface('zest-borrow', C, getLazerPriceFeeds()));
      expect(stxBalance(INTERFACE)).toBe(before - fee);
      expect(debt()).toBeGreaterThan(0n);
    });

    it('should fail on an unfunded oracle fee, then pay it after funding', () => {
      addCollateral();
      setOracleFee(500_000n);
      const before = snapshot();
      rejected(iface('zest-borrow', C, getLazerPriceFeeds()), ERR.invalidPriceUpdate);
      expect(snapshot()).toEqual(before);
      ok(simnet.transferSTX(2_000_000, INTERFACE, deployer));
      ok(iface('zest-borrow', C, getLazerPriceFeeds()));
      expect(stxBalance(INTERFACE)).toBe(1_500_000n);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx + C);
    });

    it('should enforce the 1 STX oracle fee allowance', () => {
      addCollateral();
      setOracleFee(1_000_000n);
      ok(simnet.transferSTX(3_000_000, INTERFACE, deployer));
      ok(iface('zest-borrow', C, getLazerPriceFeeds()));
      expect(stxBalance(INTERFACE)).toBe(2_000_000n);
      setOracleFee(1_000_001n);
      const before = snapshot();
      expect(iface('zest-borrow', C, getLazerPriceFeeds()).result).toHaveClarityType(ClarityType.ResponseErr);
      expect(snapshot()).toEqual(before);
      expect(stxBalance(INTERFACE)).toBe(2_000_000n);
    });

    it('should enforce market health even with a valid Lazer signature', () => {
      addCollateral();
      const before = snapshot();
      rejected(iface('zest-borrow', 1_000_000n * C, getLazerPriceFeeds()), ERR.marketUnhealthy);
      expect(snapshot()).toEqual(before);
    });

    it('should reject malformed Lazer bytes', () => {
      addCollateral();
      const before = snapshot();
      rejected(iface('zest-borrow', C, Cl.some(Cl.list([Cl.bufferFromHex('00')]))), ERR.invalidPriceUpdate);
      expect(snapshot()).toEqual(before);
    });
  });

  describe('zest-repay', () => {
    it('should return an overpayment to the reserve and clear the debt', () => {
      addCollateral();
      ok(iface('zest-borrow', 100n * C, getLazerPriceFeeds()));
      fundToken(USDCX, RESERVE, 10n * C);
      const before = snapshot();
      const repaid = amount(iface('zest-repay', 110n * C));
      expect(repaid).toBeGreaterThanOrEqual(100n * C);
      expect(repaid).toBeLessThan(110n * C);
      expect(debt()).toBe(0n);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx - repaid);
      expect(balance(USDCX, INTERFACE)).toBe(before.interfaceUsdcx);
    });

    it('should partially repay debt using only the returned amount', () => {
      addCollateral();
      ok(iface('zest-borrow', 100n * C, getLazerPriceFeeds()));
      const before = snapshot();
      const repaid = amount(iface('zest-repay', 10n * C));
      expect(repaid).toBeGreaterThan(0n);
      expect(repaid).toBeLessThanOrEqual(10n * C);
      expect(debt()).toBeGreaterThan(0n);
      expect(debt()).toBeLessThan(before.debt);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx - repaid);
      expect(balance(USDCX, INTERFACE)).toBe(before.interfaceUsdcx);
    });
  });

  describe('sweep', () => {
    function sweep(value: bigint, sender = trader) {
      return simnet.callPublicFn(INTERFACE, 'sweep', [Cl.principal(USDCX), Cl.uint(value)], sender);
    }

    it('should return only the requested tokens to the reserve', () => {
      fundToken(USDCX, INTERFACE, 2n * C);
      const before = snapshot();
      expect(sweep(C).result).toBeOk(Cl.uint(C));
      expect(balance(USDCX, INTERFACE)).toBe(before.interfaceUsdcx - C);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx + C);
    });

    it('should fail for non-trader, zero and insufficient-balance requests', () => {
      fundToken(USDCX, INTERFACE, C);
      const before = snapshot();
      rejected(sweep(C, user1), ERR.notTrader);
      rejected(sweep(0n), ERR.invalidInterfaceAmount);
      rejected(sweep(2n * C), 1n);
      expect(snapshot()).toEqual(before);
    });

    it('should fail for a removed asset', () => {
      fundToken(USDCX, INTERFACE, C);
      removeAsset(USDCX);
      const before = snapshot();
      rejected(sweep(C), ERR.notAsset);
      expect(snapshot()).toEqual(before);
    });
  });
});
