/**
 * Protocol Setup Helper
 * Initializes the hBTC protocol for testing using Clarigen
 *
 * NOTE: This is the local-testing setup.
 * - Roles are pre-configured in hq-v1.clar initialization section
 * - sBTC asset is pre-registered in state-v1.clar
 * - State variables are configured here via admin calls
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

// Role assignments (pre-configured in hq-v1.clar)
// Note: deployer is the owner
export const admin = wallet1;
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
export const hbtcToken = contracts.hbtcToken;
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
export const ROLE_ADMIN = Uint8Array.from([0x01]);
export const ROLE_GUARDIAN = Uint8Array.from([0x02]);
export const ROLE_TRADER = Uint8Array.from([0x03]);
export const ROLE_REWARDER = Uint8Array.from([0x04]);
export const ROLE_MANAGER = Uint8Array.from([0x05]);
export const ROLE_FEE_SETTER = Uint8Array.from([0x06]);
export const ROLE_PROTOCOL = Uint8Array.from([0x07]);

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
  TRADING_DISABLED: 102_007n,
  ABOVE_MAX: 102_008n,
  DEVIATION: 102_009n,
  WINDOW_CLOSED: 102_010n,
  EXPRESS_DISABLED: 102_017n,
  LIMIT_EXCEEDED: 102_020n,
  REWARD_DISABLED: 102_021n,

  // hq-hbtc errors (101xxx)
  NOT_OWNER: 101_001n,
  NOT_NEXT_OWNER: 101_002n,
  NOT_ADMIN: 101_003n,
  NOT_GUARDIAN: 101_004n,
  NOT_TRADER: 101_005n,
  NOT_REWARDER: 101_006n,
  NOT_MANAGER: 101_007n,
  NOT_FEE_SETTER: 101_008n,
  NOT_PROTOCOL: 101_009n,
  PROTOCOL_DISABLED: 101_010n,
  TIMELOCK: 101_014n,

  // blacklist errors (108xxx)
  NOT_BLACKLISTER: 108_001n,
  SOFT_BLACKLISTED: 108_002n,
  FULLY_BLACKLISTED: 108_003n,

  // hermetica-interface errors (110xxx)
  HERMETICA_INVALID_AMOUNT: 110_001n,

  // zest-interface errors (111xxx)
  ZEST_INVALID_AMOUNT: 111_001n,

  // state trading auth errors (102xxx)
  NOT_CONTRACT: 102_003n,
  NOT_ASSET: 102_004n,
};

/**
 * Mine blocks to advance time
 * Used for cooldown periods in tests
 */
export function mineBlocks(n: number) {
  for (let i = 0; i < n; i++) {
    simnet.mineEmptyBlock();
  }
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

/**
 * Initialize protocol for testing
 *
 * In the local-testing environment:
 * - Roles are pre-configured in hq-v1.clar initialization section
 * - sBTC asset is pre-registered in state-v1.clar
 *
 * This function:
 * 1. Funds test wallets with sBTC
 * 2. Configures state variables via admin calls
 */
export function initProtocol() {
  // Fund test wallets with sBTC
  fundTestWalletsWithSBTC();

  // Configure state variables (admin can call these)
  // Set deposit cap: 1000 BTC
  txOk(state.setDepositCap(1000n * ONE_BTC), admin);

  // Enable express redemptions
  txOk(state.setExpressEnabled(true), admin);

  // Disable express limit for testing (avoids limit tracking complexity)
  txOk(state.setExpressLimitEnabled(false), admin);
}

// Re-export test utilities
export { txOk, txErr, rov, rovOk, filterEvents };
