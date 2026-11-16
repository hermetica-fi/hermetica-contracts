// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Zest v2 Helper
 * Shared setup for the trading-v2 and zest-interface-v2 tests.
 *
 * The tests run against the forked mainnet Zest v0-8 market, its market vault,
 * the Pyth Lazer oracle and the canonical USDh minting and staking contracts.
 * No market or oracle fixtures are used, and all oracle checks stay active.
 * Prices come from recorded, signed Pyth Lazer updates (recordedPrices.json),
 * so the tests make no live price requests.
 */
import { Cl, ClarityType, cvToHex, cvToString, cvToValue, deserializeCV, type ClarityValue } from '@stacks/transactions';
import { expect } from 'vitest';
import recorded from './recordedPrices.json';
import {
  deployer,
  trader,
  hqHbtc,
  state,
  txOk,
  mineBlocks,
  initProtocol,
  sbtcTokenAddress,
  TIMELOCK_BLOCKS,
} from './setup.js';

// hBTC contracts
export const TRADING = `${deployer}.trading-v2`;
export const INTERFACE = `${deployer}.zest-interface-v2`;
export const RESERVE = `${deployer}.reserve`;
export const HERMETICA = `${deployer}.hermetica-interface`;
export const VAULT = `${deployer}.vault`;

// Zest v0-8 market
export const ZEST = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7';
export const MARKET = `${ZEST}.v0-8-market`;
export const MARKET_VAULT = `${ZEST}.v0-market-vault`;
export const USDH_LENDING_VAULT = `${ZEST}.v0-vault-usdh`;
export const ORACLE = `${ZEST}.pyth-lazer-oracle`;
const DIA_ORACLE = 'SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0.dia-oracle';

// Tokens
export const SBTC = sbtcTokenAddress;
export const USDCX = 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx';

// Canonical USDh contracts
export const USDH = {
  hq: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1',
  usdhToken: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1',
  susdhToken: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1',
  staking: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-v1-1',
  stakingState: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-state-v1',
  stakingSilo: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-v1-1',
  redeemingReserve: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.redeeming-reserve-v1-2',
  mintingAuto: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-v1-2',
  mintingAutoState: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-state-v1',
  mintingState: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-state-v1',
};

// Pyth contracts required by the minting-auto signature (unused for fixed-price USDCx)
export const PLAN = Cl.tuple({
  'pyth-storage-contract': Cl.principal('SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-storage-v4'),
  'pyth-decoder-contract': Cl.principal('SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-pnau-decoder-v3'),
  'wormhole-core-contract': Cl.principal('SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-core-v4'),
});

// Units
export const U = 100_000_000n;          // 1 USDh / 1 sUSDh (8 decimals)
export const C = 1_000_000n;            // 1 USDCx (6 decimals)
export const COLLATERAL = 100_000_000n; // 1 sBTC
export const OPEN_AMOUNT = 100n * U;    // 100 USDh

// Mainnet wallet holding USDCx at the fork height (Clarinet.toml initial_height)
const USDCX_FUNDING_WALLET = 'SP3A7MGAH0SKC1ACS854PHXHVWE031FYQCBA8M51D';

export const ERR = {
  notTrader: 101_004n,
  notProtocol: 101_008n,
  notAsset: 102_001n,
  notExternal: 102_002n,
  tradingDisabled: 102_008n,
  insufficientReserve: 105_001n,
  invalidInterfaceAmount: 111_001n,
  invalidTradingAmount: 120_001n,
  invalidTradingToken: 120_002n,
  belowMintingMinimum: 2_307n,
  notWhitelisted: 2_308n,
  slippageTooHigh: 2_309n,
  marketUnhealthy: 400_005n,
  missingPrice: 400_015n,
  invalidPriceUpdate: 400_022n,
  untrackedAccount: 600_006n,
};

type Receipt = ReturnType<typeof simnet.callPublicFn>;

export function ok(receipt: Receipt) {
  expect(receipt.result).toHaveClarityType(ClarityType.ResponseOk);
  return receipt;
}

export function amount(receipt: Receipt): bigint {
  ok(receipt);
  return BigInt(cvToValue(receipt.result).value);
}

export function rejected(receipt: Receipt, code: bigint) {
  expect(receipt.result).toBeErr(Cl.uint(code));
}

export function balance(token: string, owner: string): bigint {
  const result = simnet.callReadOnlyFn(token, 'get-balance', [Cl.principal(owner)], deployer).result;
  expect(result).toHaveClarityType(ClarityType.ResponseOk);
  return BigInt(cvToValue(result).value);
}

/** Transfer real forked tokens from a holder; no minting or balance overrides. */
export function fundToken(token: string, recipient: string, value: bigint) {
  const sender = token === SBTC ? deployer : token === USDCX ? USDCX_FUNDING_WALLET : undefined;
  if (!sender) throw new Error(`No funding wallet configured for ${token}`);
  const before = balance(token, recipient);
  ok(simnet.callPublicFn(token, 'transfer',
    [Cl.uint(value), Cl.principal(sender), Cl.principal(recipient), Cl.none()], sender));
  expect(balance(token, recipient)).toBe(before + value);
}

// ---- Position and balance snapshots ----

export function position(): { collateral: bigint; debt: bigint; usdhDebt: bigint } {
  const account = simnet.callReadOnlyFn(MARKET_VAULT, 'resolve-safe', [Cl.principal(INTERFACE)], deployer).result;
  if (account.type === ClarityType.ResponseErr) {
    expect(account).toBeErr(Cl.uint(ERR.untrackedAccount));
    return { collateral: 0n, debt: 0n, usdhDebt: 0n };
  }
  const result = simnet.callReadOnlyFn(MARKET_VAULT, 'get-position',
    [Cl.principal(INTERFACE), Cl.uint((1n << 128n) - 1n)], deployer).result;
  expect(result).toHaveClarityType(ClarityType.ResponseOk);
  const value = cvToValue(result).value;
  type Entry = { value: { aid: { value: string }; amount?: { value: string }; scaled?: { value: string } } };
  // Zest asset ids: 2 = sBTC collateral, 6 = USDCx debt, 8 = USDh debt.
  // get-position only lists assets in the account's mask; an absent asset is zero.
  const collateralEntry = (value.collateral.value as Entry[]).find(e => BigInt(e.value.aid.value) === 2n);
  const debtEntry = (value.debt.value as Entry[]).find(e => BigInt(e.value.aid.value) === 6n);
  const usdhDebtEntry = (value.debt.value as Entry[]).find(e => BigInt(e.value.aid.value) === 8n);
  return {
    collateral: collateralEntry ? BigInt(collateralEntry.value.amount!.value) : 0n,
    debt: debtEntry ? BigInt(debtEntry.value.scaled!.value) : 0n,
    usdhDebt: usdhDebtEntry ? BigInt(usdhDebtEntry.value.scaled!.value) : 0n,
  };
}

export const collateral = () => position().collateral;
export const debt = () => position().debt;
export const usdhDebt = () => position().usdhDebt;

export function stakingRatio(): bigint {
  const result = simnet.callReadOnlyFn(USDH.staking, 'get-usdh-per-susdh', [], deployer).result;
  expect(result).toHaveClarityType(ClarityType.ResponseOk);
  return BigInt(cvToValue(result).value);
}
export const sharesForUsdh = (value: bigint) => value * U / stakingRatio();
export const usdhForShares = (value: bigint) => value * stakingRatio() / U;

export function snapshot() {
  const current = position();
  return {
    ...current,
    reserveSbtc: balance(SBTC, RESERVE),
    reserveUsdcx: balance(USDCX, RESERVE),
    interfaceUsdcx: balance(USDCX, INTERFACE),
    hermeticaUsdcx: balance(USDCX, HERMETICA),
    custodyUsdcx: balance(USDCX, deployer),
    redeemingUsdcx: balance(USDCX, USDH.redeemingReserve),
    reserveUsdh: balance(USDH.usdhToken, RESERVE),
    reserveSusdh: balance(USDH.susdhToken, RESERVE),
  };
}

// ---- Contract calls ----

export function iface(fn: string, value: bigint, feeds: ClarityValue = Cl.none(), sender = trader, token = USDCX) {
  const args: ClarityValue[] = [Cl.principal(MARKET), Cl.principal(token), Cl.uint(value)];
  if (fn !== 'zest-repay') args.push(feeds);
  return simnet.callPublicFn(INTERFACE, fn, args, sender);
}

export function open(value: bigint, feeds: ClarityValue, sender = trader) {
  return simnet.callPublicFn(TRADING, 'zest-open-usdcx', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(USDH.mintingAuto),
    Cl.uint(value), feeds, PLAN,
  ], sender);
}

export function close(value: bigint, sender = trader) {
  return simnet.callPublicFn(TRADING, 'zest-close-usdcx', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(USDH.stakingSilo),
    Cl.principal(USDH.mintingAuto), Cl.uint(value), PLAN,
  ], sender);
}

export function closeRemove(value: bigint, remove: bigint, feeds: ClarityValue, claims: bigint[] = [], sender = trader) {
  return simnet.callPublicFn(TRADING, 'zest-close-remove-usdcx', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(USDH.stakingSilo),
    Cl.principal(USDH.mintingAuto), Cl.principal(VAULT), Cl.principal(SBTC),
    Cl.uint(value), Cl.uint(remove), Cl.list(claims.map(Cl.uint)), feeds, PLAN,
  ], sender);
}

export function generalOpen(value: bigint, feeds: ClarityValue, sender = trader, token = USDH.usdhToken) {
  return simnet.callPublicFn(TRADING, 'zest-open', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(token), Cl.uint(value), feeds,
  ], sender);
}

export function generalAddOpen(collateralAmount: bigint, borrowed: bigint, feeds: ClarityValue, sender = trader, token = USDH.usdhToken) {
  return simnet.callPublicFn(TRADING, 'zest-add-open', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(SBTC), Cl.principal(token),
    Cl.uint(collateralAmount), Cl.uint(borrowed), feeds,
  ], sender);
}

export function generalClose(value: bigint, sender = trader, token = USDH.usdhToken) {
  return simnet.callPublicFn(TRADING, 'zest-close', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(USDH.stakingSilo),
    Cl.principal(token), Cl.uint(value),
  ], sender);
}

export function generalCloseRemove(value: bigint, remove: bigint, feeds: ClarityValue, claims: bigint[] = [], sender = trader, token = USDH.usdhToken) {
  return simnet.callPublicFn(TRADING, 'zest-close-remove', [
    Cl.principal(MARKET), Cl.principal(USDH.staking), Cl.principal(USDH.stakingSilo),
    Cl.principal(VAULT), Cl.principal(SBTC), Cl.principal(token),
    Cl.uint(value), Cl.uint(remove), Cl.list(claims.map(Cl.uint)), feeds,
  ], sender);
}

// ---- Governance (timelocked request/confirm, matching the on-chain process) ----

export function removeAsset(address: string) {
  txOk(state.requestAssetRemove(address), deployer);
  mineBlocks(TIMELOCK_BLOCKS);
  txOk(state.confirmAssetRequest(address), deployer);
}

export function removeExternal(address: string) {
  txOk(state.requestExternalRemove(address), deployer);
  mineBlocks(TIMELOCK_BLOCKS);
  txOk(state.confirmExternalRequest(address), deployer);
}

export function removeProtocol(address: string) {
  txOk(hqHbtc.requestProtocolUpdate(address, false), deployer);
  mineBlocks(TIMELOCK_BLOCKS);
  txOk(hqHbtc.confirmProtocolRequest(address), deployer);
}

/** Call a canonical USDh admin function as the forked USDh HQ owner. */
export function usdhAdmin(contract: string, fn: string, args: ClarityValue[]) {
  const owner = String(cvToValue(simnet.callReadOnlyFn(USDH.hq, 'get-owner', [], deployer).result));
  expect(owner.includes('.'), 'USDh setup requires a standard owner principal').toBe(false);
  if (!cvToValue(simnet.callReadOnlyFn(USDH.hq, 'get-contract-active', [Cl.principal(owner)], deployer).result)) {
    ok(simnet.callPublicFn(USDH.hq, 'set-contract-active', [Cl.principal(owner), Cl.bool(true)], owner));
  }
  return ok(simnet.callPublicFn(contract, fn, args, owner));
}

/** Whitelist hermetica-interface for USDCx minting/redeeming on the canonical minting-auto. */
export function whitelist(minter = true, redeemer = true, slippage = 0n, custody = deployer) {
  usdhAdmin(USDH.mintingAutoState, 'set-whitelist', [
    Cl.principal(HERMETICA), Cl.principal(USDCX), Cl.bool(minter), Cl.bool(redeemer),
    Cl.uint(1), Cl.uint(slippage), Cl.principal(custody),
  ]);
}

export function setMintingMinimum(minimum: bigint) {
  usdhAdmin(USDH.mintingState, 'set-min-amount-usdh-requested', [Cl.uint(minimum)]);
}

/** Enable fixed-price USDCx minting for hermetica-interface and instant unstaking. */
export function setupMinting(minimum = U) {
  setMintingMinimum(minimum);
  usdhAdmin(USDH.mintingAutoState, 'set-supported-asset', [
    Cl.principal(USDCX), Cl.bool(true), Cl.bufferFromHex('00'), Cl.uint(0),
  ]);
  whitelist();
  usdhAdmin(USDH.stakingState, 'set-custom-cooldown', [Cl.principal(HERMETICA), Cl.uint(0)]);
}

export function setOracleFee(value: bigint) {
  // Governed call by the deployed Zest governor; signer configuration is unchanged.
  expect(simnet.callReadOnlyFn(ORACLE, 'has-role', [Cl.principal(ZEST), Cl.bufferFromHex('00')], deployer).result)
    .toBeBool(true);
  ok(simnet.callPublicFn(ORACLE, 'set-fee', [Cl.uint(value)], ZEST));
  expect(simnet.callReadOnlyFn(ORACLE, 'get-fee', [], deployer).result).toBeUint(value);
}

// ---- Position setup ----

/** initProtocol plus trading enabled; v2 roles, assets and externals are registered by initProtocol. */
export function initZestV2() {
  initProtocol();
  txOk(state.setTradingEnabled(true), deployer);
}

export function addCollateral() {
  fundToken(SBTC, RESERVE, COLLATERAL);
  expect(iface('zest-collateral-add', COLLATERAL, Cl.none(), trader, SBTC).result).toBeOk(Cl.uint(COLLATERAL));
  expect(collateral()).toBe(COLLATERAL);
}

export function setupOpen() {
  setupMinting();
  addCollateral();
  const before = balance(USDH.susdhToken, RESERVE);
  ok(open(OPEN_AMOUNT, getLazerPriceFeeds()));
  expect(debt()).toBeGreaterThan(0n);
  return balance(USDH.susdhToken, RESERVE) - before;
}

/** Mint canonical USDh into the reserve from real USDCx through hermetica-interface. */
export function mintUsdh(value: bigint) {
  const assetAmount = (value * C + U - 1n) / U;
  fundToken(USDCX, RESERVE, assetAmount);
  expect(simnet.callPublicFn(HERMETICA, 'hermetica-mint', [
    Cl.principal(USDH.mintingAuto), Cl.principal(USDCX), Cl.uint(assetAmount), Cl.uint(value),
    Cl.uint(0), Cl.none(), Cl.none(), Cl.uint(0), PLAN,
  ], trader).result).toBeOk(Cl.uint(value));
}

/** Mint and stake extra USDh so a full close can cover accrued interest. */
export function mintAndStakeExtra(value: bigint) {
  mintUsdh(value);
  const shares = sharesForUsdh(value);
  expect(simnet.callPublicFn(HERMETICA, 'hermetica-stake',
    [Cl.uint(value), Cl.principal(USDH.staking)], trader).result).toBeOk(Cl.uint(shares));
  return shares;
}

// ---- Recorded oracle data ----

/*
 * `recordedPrices.json` holds real oracle data recorded on 2026-11-09:
 * - `dia.result` is the mainnet DIA `get-value("USDh/USD")` result at Stacks block `dia.stacksHeight`.
 * - `updates` are consecutive signed Pyth Lazer updates (`evm.data` and `parsed.timestampUs`
 *   from the Granite price API), about 12 s apart over 6 minutes, signed by the mainnet Lazer key
 *   that expires 2027-08-17.
 * They replace live reads: the fork's block time is fixed and earlier than the first update.
 * Re-record them (and the DIA reading, at the same time) only if the signer rotates past its
 * expiry, the update format changes, or `initial_height` moves the fork's block time past the
 * first update.
 */
const LAZER_UPDATES = recorded.updates.map(update => ({
  published: BigInt(update.timestampUs) / 1_000_000n,
  hex: update.hex,
}));

/** Replay the recorded on-chain DIA USDh reading through its authorized updater. */
export function refreshDiaUsdhPrice() {
  const key = Cl.stringAscii('USDh/USD');
  const current = deserializeCV(recorded.dia.result);
  if (current.type !== ClarityType.ResponseOk || current.value.type !== ClarityType.Tuple) {
    throw new Error('DIA USDh price is not an ok tuple');
  }
  const price = current.value.value.value;
  const timestamp = current.value.value.timestamp;
  if (price?.type !== ClarityType.UInt || timestamp?.type !== ClarityType.UInt) {
    throw new Error('DIA USDh price or timestamp is invalid');
  }
  const updater = simnet.callReadOnlyFn(DIA_ORACLE, 'get-oracle-updater', [], deployer).result;
  if (updater.type !== ClarityType.PrincipalStandard) throw new Error('DIA updater must be a standard principal');
  const sender = String(cvToValue(updater));
  const replay = simnet.callPublicFn(DIA_ORACLE, 'set-value', [key, Cl.uint(price.value), Cl.uint(timestamp.value)], sender).result;
  if (replay.type !== ClarityType.ResponseOk) throw new Error(`DIA replay failed: ${cvToString(replay)}`);
  const stored = simnet.callReadOnlyFn(DIA_ORACLE, 'get-value', [key], deployer).result;
  if (cvToHex(stored) !== cvToHex(current)) throw new Error('Local DIA reading differs from the recorded price');
}

/**
 * Return the recorded signed Lazer update for the current simnet time: the latest one published
 * at or before now if at most 15 s old; otherwise mine forward to the next one. Only simnet time
 * is aligned; all oracle checks stay active.
 */
export function getLazerPriceFeeds() {
  let now = simnet.getBlockTime();
  let update = LAZER_UPDATES.filter(candidate => candidate.published <= now).at(-1);
  if (!update || now > update.published + 15n) {
    update = LAZER_UPDATES.find(candidate => candidate.published > now);
    if (!update) {
      throw new Error(`Simnet (${now}) is past the recorded Lazer updates; perform timelocked setup before price-sensitive actions`);
    }
    const before = now;
    simnet.mineEmptyStacksBlock();
    now = simnet.getBlockTime();
    const step = now - before;
    if (step <= 0n) throw new Error('Simnet block time did not advance');
    if (now < update.published) {
      simnet.mineEmptyStacksBlocks(Number((update.published - now + step - 1n) / step));
      now = simnet.getBlockTime();
    }
    if (now < update.published || now > update.published + 15n) {
      throw new Error(`Simnet (${now}) missed the 15 s window of the Lazer update published at ${update.published}`);
    }
  }
  return Cl.some(Cl.list([Cl.bufferFromHex(update.hex)]));
}
