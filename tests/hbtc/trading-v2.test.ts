// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Trading v2 Contract Tests
 * Tests for trading-v2.clar - Atomic Zest v0-8 position management
 *
 * Contract: mainnet/contracts/hbtc/protocol/trading-v2.clar
 *
 * Key concepts for bounty hunters:
 * - Trading combines zest-interface-v2 and hermetica-interface operations atomically
 * - Trader role required for all operations; any failing leg rolls back the whole call
 * - USDCx flows borrow USDCx, mint USDh 1:1 and stake it (and the reverse to close)
 * - USDh amounts must convert to whole USDCx base units using the registered token bases
 * - Funding vault claims after a close requires the vault to hold the protocol role
 *
 * Main flows tested:
 * - zest-open-usdcx: Borrow USDCx -> Mint USDh -> Stake
 * - zest-close-usdcx: Unstake -> Redeem USDCx -> Repay
 * - zest-close-remove-usdcx: Close USDCx position -> Remove collateral -> Fund claims
 * - zest-open / zest-add-open / zest-close / zest-close-remove: USDh debt flows
 *
 * Runs against the forked mainnet market with recorded Lazer prices (see helpers/zest-v2.ts).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl, cvToValue } from '@stacks/transactions';
import { deployer, user1 } from '../helpers/setup.js';
import {
  USDH,
  USDH_LENDING_VAULT,
  SBTC,
  USDCX,
  INTERFACE,
  RESERVE,
  HERMETICA,
  VAULT,
  U,
  C,
  COLLATERAL,
  OPEN_AMOUNT,
  ERR,
  ok,
  amount,
  rejected,
  balance,
  debt,
  usdhDebt,
  collateral,
  snapshot,
  sharesForUsdh,
  usdhForShares,
  open,
  close,
  closeRemove,
  generalOpen,
  generalAddOpen,
  generalClose,
  generalCloseRemove,
  fundToken,
  usdhAdmin,
  whitelist,
  setMintingMinimum,
  setupMinting,
  addCollateral,
  setupOpen,
  mintAndStakeExtra,
  removeAsset,
  removeProtocol,
  initZestV2,
  getLazerPriceFeeds,
  refreshDiaUsdhPrice,
} from '../helpers/zest-v2.js';

/** Deposit sBTC into the hBTC vault and request a standard redemption; returns the claim id. */
function requestClaim(assets: bigint) {
  const shares = amount(simnet.callPublicFn(VAULT, 'deposit', [Cl.uint(assets), Cl.none()], user1));
  return amount(simnet.callPublicFn(VAULT, 'request-redeem', [Cl.uint(shares), Cl.bool(false)], user1));
}

function claimAssets(id: bigint): bigint {
  const claim = cvToValue(simnet.callReadOnlyFn(VAULT, 'get-claim', [Cl.uint(id)], deployer).result).value;
  return BigInt(claim.assets.value.value);
}

describe('Trading v2 Contract', () => {
  beforeEach(() => {
    initZestV2();
  });

  describe('zest-open-usdcx (Borrow USDCx -> Mint USDh -> Stake)', () => {
    it('should fail for a non-trader and for amounts that are not whole USDCx units', () => {
      const before = snapshot();
      rejected(open(OPEN_AMOUNT, Cl.none(), user1), ERR.notTrader);
      for (const value of [0n, 99n, OPEN_AMOUNT + 1n]) rejected(open(value, Cl.none()), ERR.invalidTradingAmount);
      expect(snapshot()).toEqual(before);
    });

    it('should borrow, mint 1:1 and stake without spending existing reserve USDCx', () => {
      setupMinting();
      addCollateral();
      fundToken(USDCX, RESERVE, 2n * C);
      const before = snapshot();
      const expectedShares = sharesForUsdh(OPEN_AMOUNT);
      ok(open(OPEN_AMOUNT, getLazerPriceFeeds()));
      expect(debt()).toBeGreaterThan(0n);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx);
      expect(balance(USDCX, deployer)).toBe(before.custodyUsdcx + OPEN_AMOUNT / 100n);
      expect(balance(USDCX, HERMETICA)).toBe(before.hermeticaUsdcx);
      expect(balance(USDH.usdhToken, RESERVE)).toBe(before.reserveUsdh);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(before.reserveSusdh + expectedShares);
    });

    it('should roll back the borrow when the mint whitelist rejects the interface', () => {
      setupMinting();
      addCollateral();
      whitelist(false, true);
      const before = snapshot();
      rejected(open(OPEN_AMOUNT, getLazerPriceFeeds()), ERR.notWhitelisted);
      expect(snapshot()).toEqual(before);
    });
  });

  describe('zest-close-usdcx (Unstake -> Redeem USDCx -> Repay)', () => {
    it('should fail for a non-trader, zero and sub-unit amounts without losing shares', () => {
      setupOpen();
      const before = snapshot();
      rejected(close(U, user1), ERR.notTrader);
      rejected(close(0n), ERR.invalidTradingAmount);
      rejected(close(sharesForUsdh(99n)), ERR.invalidTradingAmount);
      expect(snapshot()).toEqual(before);
    });

    it('should unstake, redeem and repay debt while keeping sub-unit USDh dust in the reserve', () => {
      setupOpen();
      fundToken(USDCX, USDH.redeemingReserve, 100n * C);
      const before = snapshot();
      const unstaked = sharesForUsdh(50n * U) + 1n;
      const received = usdhForShares(unstaked);
      const converted = received * C / U;
      const dust = received - converted * U / C;
      const repaid = amount(close(unstaked));
      expect(repaid).toBeGreaterThan(0n);
      expect(repaid).toBeLessThanOrEqual(converted);
      expect(debt()).toBeGreaterThan(0n);
      expect(debt()).toBeLessThan(before.debt);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(before.reserveSusdh - unstaked);
      expect(balance(USDH.usdhToken, RESERVE)).toBe(before.reserveUsdh + dust);
      expect(balance(USDCX, USDH.redeemingReserve)).toBe(before.redeemingUsdcx - converted);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx + converted - repaid);
      expect(balance(USDCX, INTERFACE)).toBe(before.interfaceUsdcx);
    });

    it('should enforce the USDh redemption minimum and close only after interest is covered', () => {
      setupMinting(100n * U);
      addCollateral();
      ok(open(OPEN_AMOUNT, getLazerPriceFeeds()));
      const shares = balance(USDH.susdhToken, RESERVE) - 1n;
      expect(usdhForShares(shares)).toBeLessThan(100n * U);
      const before = snapshot();
      rejected(close(shares), ERR.belowMintingMinimum);
      expect(snapshot()).toEqual(before);
      // Mint the extra USDh below the 100 USDh minimum, then restore it.
      setMintingMinimum(U);
      mintAndStakeExtra(2n * U);
      setMintingMinimum(100n * U);
      fundToken(USDCX, USDH.redeemingReserve, 102n * C);
      const repaid = amount(closeRemove(balance(USDH.susdhToken, RESERVE), COLLATERAL, Cl.none()));
      expect(repaid).toBeGreaterThanOrEqual(100n * C);
      expect(repaid).toBeLessThan(101n * C);
      expect(debt()).toBe(0n);
      expect(collateral()).toBe(0n);
    });

    it('should roll back unstaking when the redeeming reserve cannot pay USDCx', () => {
      setupOpen();
      const liquidity = balance(USDCX, USDH.redeemingReserve);
      if (liquidity > 0n) usdhAdmin(USDH.redeemingReserve, 'transfer',
        [Cl.uint(liquidity), Cl.principal(deployer), Cl.principal(USDCX), Cl.none()]);
      const empty = snapshot();
      rejected(close(sharesForUsdh(50n * U)), 1n);
      expect(snapshot()).toEqual(empty);
    });

    it('should roll back instead of redeeming below 1:1 when whitelist slippage changes', () => {
      setupOpen();
      fundToken(USDCX, USDH.redeemingReserve, 100n * C);
      whitelist(true, true, 10n);
      const before = snapshot();
      rejected(close(sharesForUsdh(50n * U)), ERR.slippageTooHigh);
      expect(snapshot()).toEqual(before);
    });
  });

  describe('zest-close-remove-usdcx (Close -> Remove Collateral -> Fund Claims)', () => {
    it('should fail for a non-trader and invalid amounts before changing debt', () => {
      const before = snapshot();
      rejected(closeRemove(U, 1n, Cl.none(), [], user1), ERR.notTrader);
      rejected(closeRemove(U, 0n, Cl.none()), ERR.invalidTradingAmount);
      rejected(closeRemove(0n, 1n, Cl.none()), ERR.invalidTradingAmount);
      expect(snapshot()).toEqual(before);
    });

    it('should require a price update when a partial close leaves debt', () => {
      setupOpen();
      fundToken(USDCX, USDH.redeemingReserve, 100n * C);
      const before = snapshot();
      const shares = sharesForUsdh(50n * U);
      const converted = usdhForShares(shares) * C / U;
      rejected(closeRemove(shares, 1_000_000n, Cl.none()), ERR.missingPrice);
      expect(snapshot()).toEqual(before);
      const repaid = amount(closeRemove(shares, 1_000_000n, getLazerPriceFeeds()));
      expect(repaid).toBeGreaterThan(0n);
      expect(repaid).toBeLessThanOrEqual(converted);
      expect(debt()).toBeGreaterThan(0n);
      expect(collateral()).toBe(COLLATERAL - 1_000_000n);
      expect(balance(SBTC, RESERVE)).toBe(before.reserveSbtc + 1_000_000n);
    });

    it('should fully close with an overpayment and remove collateral without an oracle update', () => {
      setupOpen();
      mintAndStakeExtra(2n * U);
      fundToken(USDCX, USDH.redeemingReserve, 102n * C);
      const before = snapshot();
      const shares = balance(USDH.susdhToken, RESERVE);
      const converted = usdhForShares(shares) * C / U;
      const repaid = amount(closeRemove(shares, COLLATERAL, Cl.none()));
      expect(repaid).toBeGreaterThanOrEqual(100n * C);
      expect(repaid).toBeLessThan(101n * C);
      expect(debt()).toBe(0n);
      expect(collateral()).toBe(0n);
      expect(balance(SBTC, RESERVE)).toBe(before.reserveSbtc + COLLATERAL);
      expect(balance(USDCX, RESERVE)).toBe(before.reserveUsdcx + converted - repaid);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(0n);
    });

    it('should fund a vault claim after repaying and removing collateral', () => {
      setupOpen();
      mintAndStakeExtra(2n * U);
      fundToken(USDCX, USDH.redeemingReserve, 102n * C);
      const assets = 1_000_000n;
      const claimId = requestClaim(assets);
      const vaultBefore = balance(SBTC, VAULT);
      const repaid = amount(closeRemove(balance(USDH.susdhToken, RESERVE), COLLATERAL, Cl.none(), [claimId]));
      expect(repaid).toBeGreaterThan(0n);
      expect(debt()).toBe(0n);
      expect(collateral()).toBe(0n);
      expect(balance(SBTC, VAULT)).toBe(vaultBefore + assets);
      expect(claimAssets(claimId)).toBe(assets);
    });

    it('should roll back every leg if the vault protocol role was removed', () => {
      setupOpen();
      mintAndStakeExtra(100n * U);
      fundToken(USDCX, USDH.redeemingReserve, 200n * C);
      // The timelock advances simnet time; the excess repayment clears accrued interest
      // first, so the debt-free collateral removal needs no newer price update.
      removeProtocol(VAULT);
      const before = snapshot();
      rejected(closeRemove(balance(USDH.susdhToken, RESERVE), COLLATERAL, Cl.none(), [1n]), ERR.notProtocol);
      expect(snapshot()).toEqual(before);
    });
  });

  describe('USDCx registry units', () => {
    it.each([
      ['USDCx', USDCX],
      ['USDh', USDH.usdhToken],
    ])('should reject all USDCx position operations after governed removal of %s', (_name, token) => {
      removeAsset(token);
      const before = snapshot();
      rejected(open(OPEN_AMOUNT, Cl.none()), ERR.invalidTradingToken);
      rejected(close(U), ERR.invalidTradingToken);
      rejected(closeRemove(U, 1n, Cl.none()), ERR.invalidTradingToken);
      expect(snapshot()).toEqual(before);
    });
  });

  // The close-side u120003 (ERR_UNEXPECTED_AMOUNT) guard cannot be triggered through the
  // zero-slippage fixed-price USDCx minting-auto path; it remains uncovered.

  describe('USDh position operations (zest-open / zest-add-open / zest-close / zest-close-remove)', () => {
    it('should require the trader role for each operation', () => {
      const before = snapshot();
      rejected(generalOpen(U, Cl.none(), user1), ERR.notTrader);
      rejected(generalAddOpen(COLLATERAL, U, Cl.none(), user1), ERR.notTrader);
      rejected(generalClose(U, user1), ERR.notTrader);
      rejected(generalCloseRemove(U, COLLATERAL, Cl.none(), [], user1), ERR.notTrader);
      expect(snapshot()).toEqual(before);
    });

    it('should reject zero amounts before changing any position', () => {
      const before = snapshot();
      rejected(generalOpen(0n, Cl.none()), ERR.invalidTradingAmount);
      rejected(generalAddOpen(0n, U, Cl.none()), ERR.invalidTradingAmount);
      rejected(generalAddOpen(COLLATERAL, 0n, Cl.none()), ERR.invalidTradingAmount);
      rejected(generalClose(0n), ERR.invalidTradingAmount);
      rejected(generalCloseRemove(0n, COLLATERAL, Cl.none()), ERR.invalidTradingAmount);
      rejected(generalCloseRemove(U, 0n, Cl.none()), ERR.invalidTradingAmount);
      expect(snapshot()).toEqual(before);
    });

    it('should reject a non-USDh borrow token and roll back the collateral addition', () => {
      fundToken(SBTC, RESERVE, COLLATERAL);
      const before = snapshot();
      rejected(generalOpen(C, Cl.none(), undefined, USDCX), ERR.invalidTradingToken);
      rejected(generalAddOpen(COLLATERAL, C, Cl.none(), undefined, USDCX), ERR.invalidTradingToken);
      expect(snapshot()).toEqual(before);
    });

    it('should reject a non-USDh repay token without losing staked shares', () => {
      setupMinting();
      mintAndStakeExtra(2n * U);
      const before = snapshot();
      rejected(generalClose(U, undefined, USDCX), ERR.invalidTradingToken);
      rejected(generalCloseRemove(U, COLLATERAL, Cl.none(), [], undefined, USDCX), ERR.invalidTradingToken);
      expect(snapshot()).toEqual(before);
    });

    it('should open and partially close USDh debt through mainnet staking', () => {
      setupMinting();
      addCollateral();
      const before = snapshot();
      const expectedShares = sharesForUsdh(OPEN_AMOUNT);
      refreshDiaUsdhPrice();
      expect(generalOpen(OPEN_AMOUNT, getLazerPriceFeeds()).result).toBeOk(Cl.bool(true));
      expect(usdhDebt()).toBeGreaterThan(0n);
      expect(balance(USDH.usdhToken, RESERVE)).toBe(before.reserveUsdh);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(before.reserveSusdh + expectedShares);
      const shares = sharesForUsdh(50n * U);
      const received = usdhForShares(shares);
      const reserveBefore = balance(USDH.usdhToken, RESERVE);
      const lenderBefore = balance(USDH.usdhToken, USDH_LENDING_VAULT);
      const debtBefore = usdhDebt();
      expect(generalClose(shares).result).toBeOk(Cl.bool(true));
      const repaid = balance(USDH.usdhToken, USDH_LENDING_VAULT) - lenderBefore;
      expect(repaid).toBeGreaterThan(0n);
      expect(repaid).toBeLessThanOrEqual(received);
      expect(balance(USDH.usdhToken, RESERVE)).toBe(reserveBefore + received - repaid);
      expect(usdhDebt()).toBeLessThan(debtBefore);
      expect(usdhDebt()).toBeGreaterThan(0n);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(before.reserveSusdh + expectedShares - shares);
    });

    it('should add collateral and open, then fully close USDh debt and remove collateral', () => {
      setupMinting();
      fundToken(SBTC, RESERVE, COLLATERAL);
      const expectedShares = sharesForUsdh(OPEN_AMOUNT);
      refreshDiaUsdhPrice();
      expect(generalAddOpen(COLLATERAL, OPEN_AMOUNT, getLazerPriceFeeds()).result).toBeOk(Cl.bool(true));
      expect(collateral()).toBe(COLLATERAL);
      expect(usdhDebt()).toBeGreaterThan(0n);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(expectedShares);
      mintAndStakeExtra(2n * U);
      const before = snapshot();
      expect(generalCloseRemove(balance(USDH.susdhToken, RESERVE), COLLATERAL, Cl.none()).result)
        .toBeOk(Cl.bool(true));
      expect(usdhDebt()).toBe(0n);
      expect(collateral()).toBe(0n);
      expect(balance(SBTC, RESERVE)).toBe(before.reserveSbtc + COLLATERAL);
      expect(balance(USDH.susdhToken, RESERVE)).toBe(0n);
    });

    it('should fund a vault claim after a USDh close and collateral removal', () => {
      setupMinting();
      addCollateral();
      refreshDiaUsdhPrice();
      expect(generalOpen(OPEN_AMOUNT, getLazerPriceFeeds()).result).toBeOk(Cl.bool(true));
      mintAndStakeExtra(2n * U);
      const assets = 1_000_000n;
      const id = requestClaim(assets);
      const before = balance(SBTC, VAULT);
      expect(generalCloseRemove(balance(USDH.susdhToken, RESERVE), COLLATERAL, Cl.none(), [id]).result)
        .toBeOk(Cl.bool(true));
      expect(usdhDebt()).toBe(0n);
      expect(collateral()).toBe(0n);
      expect(balance(SBTC, VAULT)).toBe(before + assets);
      expect(claimAssets(id)).toBe(assets);
    });
  });
});
