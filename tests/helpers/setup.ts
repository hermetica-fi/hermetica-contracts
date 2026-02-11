// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Hermetica Labs, Inc.

/**
 * Protocol Setup Helper
 * Initializes the hBTC protocol for testing using Clarigen
 *
 * NOTE: Contract source of truth is mainnet/contracts/.
 * Roles, assets, and externals are initialized here via timelocked
 * request/confirm flows (matching the on-chain governance process).
 * State variables are configured here via owner (deployer) calls.
 */
import { project, accounts } from '../clarigen-types.js';
import { projectFactory } from '@clarigen/core';
import { txOk, txErr, rov, rovOk, filterEvents } from '@clarigen/test';
import { Cl } from '@stacks/transactions';
import { expect } from 'vitest';

// Initialize contract instances using projectFactory
export const contracts = projectFactory(project, "simnet");

// Export commonly used accounts
export const deployer = accounts.deployer.address;
export const wallet1 = accounts.wallet_1.address;
export const wallet2 = accounts.wallet_2.address;
export const wallet3 = accounts.wallet_3.address;
export const wallet4 = accounts.wallet_4.address;
export const wallet5 = accounts.wallet_5.address;
export const wallet6 = accounts.wallet_6.address;
export const wallet7 = accounts.wallet_7.address;
export const wallet8 = accounts.wallet_8.address;

// Role assignments
export const guardian = wallet2;
export const trader = wallet3;
export const rewarder = wallet4;
export const manager = wallet5;
export const user1 = wallet6;
export const user2 = wallet7;
export const user3 = wallet8;

// hBTC Protocol contracts
export const vault = contracts.vault;
export const state = contracts.state;
export const controllerHbtc = contracts.controllerHbtc;
export const hqHbtc = contracts.hqHbtc;
export const hbtcToken = contracts.tokenHbtc;
export const reserve = contracts.reserve;
export const reserveFund = contracts.reserveFund;
export const feeCollector = contracts.feeCollector;
export const blacklist = contracts.blacklist;
export const trading = contracts.trading;

// Interface contracts
export const zestInterface = contracts.zestInterface;
export const hermeticaInterface = contracts.hermeticaInterface;
export const graniteInterface = contracts.graniteInterface;

// USDh Protocol contracts
export const usdhToken = contracts.usdhToken;
export const susdhToken = contracts.susdhToken;
export const staking = contracts.staking;
export const stakingSilo = contracts.stakingSilo;
export const stakingState = contracts.stakingState;
export const stakingReserve = contracts.stakingReserve;
export const mintingAuto = contracts.mintingAuto;
export const mintingAutoState = contracts.mintingAutoState;
export const hqUsdh = contracts.hq;

// sBTC token address (mainnet contract)
export const sbtcTokenAddress = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

// Mainnet wallet with sBTC for funding test wallets
export const sbtcFundingWallet = 'SM35BNE8A592DRTQ7XVF1T3KY37XEZTPGGDC8EQYP';

// Protocol constants
export const SHARE_BASE = 100_000_000n;  // 10^8
export const BPS_BASE = 10_000n;         // 10^4
export const ONE_BTC = 100_000_000n;     // 1 BTC in satoshis (8 decimals)
export const ONE_USDH = 100_000_000n;    // 1 USDh (8 decimals)
export const ONE_SUSDH = 100_000_000n;   // 1 sUSDh (8 decimals)

// Cooldown periods (contract defaults - reasonable for testing)
export const STANDARD_COOLDOWN = 259_200;  // 3 days in seconds
export const EXPRESS_COOLDOWN = 14_400;    // 4 hours in seconds
export const UPDATE_WINDOW = 86_340;       // ~23 hours 59 minutes
export const EXPRESS_WINDOW = 86_400;      // 1 day

// Role type constants (from hq-hbtc)
export const ROLE_GUARDIAN = Uint8Array.from([0x01]);
export const ROLE_TRADER = Uint8Array.from([0x02]);
export const ROLE_REWARDER = Uint8Array.from([0x03]);
export const ROLE_MANAGER = Uint8Array.from([0x04]);
export const ROLE_FEE_SETTER = Uint8Array.from([0x05]);
export const ROLE_PROTOCOL = Uint8Array.from([0x06]);

// Error codes
export const ERR = {
  // vault-v1 errors (103xxx)
  DEPOSIT_CAP_EXCEEDED: 103_001n,
  BELOW_MIN: 103_002n,
  NO_CLAIM_FOR_ID: 103_003n,
  NOT_COOLED_DOWN: 103_004n,
  ALREADY_FUNDED: 103_005n,
  NOT_FUNDED: 103_006n,
  EMPTY_LIST: 103_007n,
  NOT_AUTHORIZED: 103_008n,
  NOT_ALLOWED: 103_009n,
  SENDER_NOT_CALLER: 103_010n,

  // controller-hbtc errors (104xxx)
  ZERO_ONLY_POSITIVE: 104_001n,
  INSUFFICIENT_FUNDS: 104_002n,

  // state errors (102xxx)
  DEPOSIT_DISABLED: 102_005n,
  REDEEM_DISABLED: 102_006n,
  REQUEST_REDEEM_DISABLED: 102_007n,
  TRADING_DISABLED: 102_008n,
  ABOVE_MAX: 102_009n,
  STATE_BELOW_MIN: 102_010n,
  WINDOW_CLOSED: 102_011n,
  DEVIATION: 102_014n,
  EXPRESS_DISABLED: 102_018n,
  LIMIT_EXCEEDED: 102_021n,
  REWARD_DISABLED: 102_022n,

  // hq-hbtc errors (101xxx)
  NOT_OWNER: 101_001n,
  NOT_NEXT_OWNER: 101_002n,
  NOT_GUARDIAN: 101_003n,
  NOT_TRADER: 101_004n,
  NOT_REWARDER: 101_005n,
  NOT_MANAGER: 101_006n,
  NOT_FEE_SETTER: 101_007n,
  NOT_PROTOCOL: 101_008n,
  PROTOCOL_DISABLED: 101_009n,
  TIMELOCK: 101_013n,

  // blacklist errors (108xxx)
  NOT_BLACKLISTER: 108_001n,
  SOFT_BLACKLISTED: 108_002n,
  FULLY_BLACKLISTED: 108_003n,

  // hermetica-interface errors (110xxx)
  HERMETICA_INVALID_AMOUNT: 110_001n,

  // zest-interface errors (111xxx)
  ZEST_INVALID_AMOUNT: 111_001n,

  // trading errors (120xxx)
  TRADING_INVALID_AMOUNT: 120_001n,

  // state trading auth errors (102xxx)
  NOT_CONTRACT: 102_003n,
  NOT_ASSET: 102_004n,
};

// Blocks to mine to pass the 86400-second timelock (~1 day, ~523s/block in simnet)
const TIMELOCK_BLOCKS = 170;

/**
 * Mine blocks to advance time
 * Used for cooldown periods in tests
 */
export function mineBlocks(n: number) {
  simnet.mineEmptyBlocks(n);
}

/**
 * Fund test wallets with sBTC from a mainnet holder
 * Uses simnet's ability to impersonate mainnet wallets
 */
export function fundTestWalletsWithSBTC() {
  const walletsToFund = [user1, user2, user3, manager, rewarder, deployer];

  // First transfer a large amount to deployer from the funding wallet
  const initialTransfer = simnet.callPublicFn(
    sbtcTokenAddress,
    'transfer',
    [
      Cl.uint(1000n * ONE_BTC), // 1000 BTC
      Cl.principal(sbtcFundingWallet),
      Cl.principal(deployer),
      Cl.none(),
    ],
    sbtcFundingWallet
  );
  expect(initialTransfer.result).toBeOk(Cl.bool(true));

  // Then distribute to test wallets
  for (const wallet of walletsToFund) {
    if (wallet === deployer) continue; // Skip deployer, already funded
    const transfer = simnet.callPublicFn(
      sbtcTokenAddress,
      'transfer',
      [
        Cl.uint(100n * ONE_BTC), // 100 BTC each
        Cl.principal(deployer),
        Cl.principal(wallet),
        Cl.none(),
      ],
      deployer
    );
    expect(transfer.result).toBeOk(Cl.bool(true));
  }
}

// Asset addresses
const SBTC_TOKEN = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';
const USDH_TOKEN = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1';
const SUSDH_TOKEN = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1';
const ZEST_VAULT_SBTC = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc';

// Price feed IDs (Pyth oracle)
const SBTC_PRICE_FEED = Uint8Array.from(
  Buffer.from('e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', 'hex')
);
const USDH_PRICE_FEED = Uint8Array.from([0x01]);
const SUSDH_PRICE_FEED = Uint8Array.from([0x02]);

/**
 * Initialize protocol for testing
 *
 * All timelocked requests (roles + assets + externals) are batched in the same
 * block, time is advanced once past the 86400-second timelock, then all confirms
 * are batched together.
 *
 * Sets up the complete protocol state:
 * 1. Initializes HQ roles (guardian, trader, rewarder, manager, protocol)
 * 2. Registers assets and externals in state contract
 * 3. Funds test wallets with sBTC
 * 4. Configures state variables via owner (deployer) calls
 */
export function initProtocol() {
  const tradingContract = `${deployer}.trading`;

  // ---- Batch all timelocked requests ----

  // HQ role requests (caller = deployer = owner)
  txOk(hqHbtc.requestGuardianUpdate(guardian, true), deployer);

  txOk(hqHbtc.requestTraderUpdate(trader, true), deployer);
  txOk(hqHbtc.requestTraderUpdate(tradingContract, true), deployer);

  txOk(hqHbtc.requestRewarderUpdate(rewarder, true), deployer);
  txOk(hqHbtc.requestRewarderUpdate(tradingContract, true), deployer);

  txOk(hqHbtc.requestManagerUpdate(manager, true), deployer);
  txOk(hqHbtc.requestManagerUpdate(tradingContract, true), deployer);

  const protocolContracts = [
    'controller-hbtc', 'vault', 'state', 'reserve',
    'reserve-fund', 'fee-collector', 'zest-interface', 'hermetica-interface',
  ];
  for (const name of protocolContracts) {
    txOk(hqHbtc.requestProtocolUpdate(`${deployer}.${name}`, true), deployer);
  }

  // State asset requests (all 8 decimals, 500 bps max slippage)
  // Note: v0-vault-sbtc is registered via callPrivateFn below because its contract
  // is not callable in simnet (remote_data doesn't load it), so requestAssetAdd
  // (which calls get-decimals) would fail with NoSuchContract.
  txOk(state.requestAssetAdd(SBTC_TOKEN, SBTC_PRICE_FEED, 8n, 500n, false), deployer);
  txOk(state.requestAssetAdd(USDH_TOKEN, USDH_PRICE_FEED, 8n, 500n, true), deployer);
  txOk(state.requestAssetAdd(SUSDH_TOKEN, SUSDH_PRICE_FEED, 8n, 500n, false), deployer);

  // State external requests
  const externals = [
    'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-3-market',
    'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',
    'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',
    'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.zsbtc-v2-0',
    'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-v1-1',
    'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-v1-1',
  ];
  for (const ext of externals) {
    txOk(state.requestExternalAdd(ext), deployer);
  }

  // ---- Advance time past the 86400-second timelock ----
  mineBlocks(TIMELOCK_BLOCKS);

  // ---- Batch all timelocked confirms ----

  // Confirm HQ role assignments
  txOk(hqHbtc.confirmGuardianRequest(guardian), deployer);

  txOk(hqHbtc.confirmTraderRequest(trader), deployer);
  txOk(hqHbtc.confirmTraderRequest(tradingContract), deployer);

  txOk(hqHbtc.confirmRewarderRequest(rewarder), deployer);
  txOk(hqHbtc.confirmRewarderRequest(tradingContract), deployer);

  txOk(hqHbtc.confirmManagerRequest(manager), deployer);
  txOk(hqHbtc.confirmManagerRequest(tradingContract), deployer);

  for (const name of protocolContracts) {
    txOk(hqHbtc.confirmProtocolRequest(`${deployer}.${name}`), deployer);
  }

  // Confirm state asset additions
  txOk(state.confirmAssetRequest(SBTC_TOKEN), deployer);
  txOk(state.confirmAssetRequest(USDH_TOKEN), deployer);
  txOk(state.confirmAssetRequest(SUSDH_TOKEN), deployer);

  // Confirm state external additions
  for (const ext of externals) {
    txOk(state.confirmExternalRequest(ext), deployer);
  }

  // Register v0-vault-sbtc as asset via callPrivateFn (bypasses get-decimals check).
  // The contract is not callable in simnet so requestAssetAdd would fail.
  // ASSET type = 0xA0 in the state contract.
  const vaultResult = simnet.callPrivateFn(
    `${deployer}.state`,
    'execute-map-update',
    [
      Cl.bufferFromHex('A0'),
      Cl.contractPrincipal('SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7', 'v0-vault-sbtc'),
      Cl.bool(true),
      Cl.some(Cl.tuple({
        'price-feed-id': Cl.buffer(SBTC_PRICE_FEED),
        'token-base': Cl.uint(100_000_000),
        'max-slippage': Cl.uint(500),
        'is-stablecoin': Cl.bool(false),
      })),
    ],
    deployer
  );
  expect(vaultResult.result).toStrictEqual(Cl.bool(true));

  // Fund test wallets with sBTC
  fundTestWalletsWithSBTC();

  // Configure state variables
  // Set deposit cap: 1000 BTC
  txOk(state.setDepositCap(1000n * ONE_BTC), deployer);

  // Enable express redemptions
  txOk(state.setExpressEnabled(true), deployer);

  // Disable express limit for testing (avoids limit tracking complexity)
  txOk(state.setExpressLimitEnabled(false), deployer);
}

// Re-export test utilities
export { txOk, txErr, rov, rovOk, filterEvents };
