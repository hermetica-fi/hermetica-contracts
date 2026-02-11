# Hermetica hBTC Protocol

Hermetica hBTC is a Bitcoin yield vault written in Clarity with ERC-4626-style share mint/redeem, daily NAV updates, and strategy execution via external protocol integrations.

### mainnet/
Production Clarity contracts and audit reports:
- All hBTC and USDh protocol contracts (source of truth)
- Audit reports with remediation details

**[View Audit Reports →](mainnet/README.md)**

### tests/
**For Security Researchers:**
- Complete test suite with 115 tests across vault, controller, trading, and interface contracts
- Mainnet fork testing with real Zest and Hermetica integrations
- Protocol initialization via timelocked governance flows (matching the on-chain process)
- TypeScript types via Clarigen

**[Security Researchers: Get Started →](#quick-start)**

## Bug Bounty

**Active bug bounty program on Immunefi:** https://immunefi.com/bug-bounty/hermetica/

For security research, focus on:
- Authorization bypasses
- Share price manipulation
- Cooldown circumvention
- Asset theft vectors
- Blacklist evasion
- Cross-protocol integration vulnerabilities

## Key Features

- **Yield-Bearing Bitcoin**: Deposit sBTC, receive hBTC shares that appreciate as protocol earns yield
- **DeFi Integrations**: Atomic position management across Zest (borrow/lend) and Hermetica USDh (stake)
- **Flexible Redemptions**: Standard (3-day) or Express (4-hour) cooldown periods
- **Loss Protection**: Reserve fund absorbs losses before affecting share price
- **Role-Based Access**: Timelocked governance with guardian emergency controls

## Core Components

| Contract | Purpose |
|----------|---------|
| `vault-v1.clar` | Core deposit/redeem logic, claim management |
| `controller-v1.clar` | Reward distribution, fee accounting, reserve fund loss handling |
| `state-v1.clar` | Central configuration, timelocked parameter updates, feature flags, asset/external registries, share accounting |
| `hq-v1.clar` | Role-based access control with timelock |
| `reserve-v1.clar` | Holds protocol assets (sBTC) |
| `reserve-fund-v1.clar` | Loss absorption buffer |
| `fee-collector-v1.clar` | Collects and distributes fees |
| `blacklist-v1.clar` | Dual-level (soft/full) address restriction management |
| `trading-v1.clar` | Atomic DeFi position management |
| `token-hbtc.clar` | SIP-010 hBTC token (shares) |

## External Interfaces

| Contract | Integration | Purpose |
|----------|-------------|---------|
| `zest-interface-v1.clar` | Zest Protocol v2 | Collateral management, borrowing stablecoins |
| `hermetica-interface-v1.clar` | Hermetica USDh | Stake/unstake sUSDh for yield, mint/redeem USDh |
| `granite-interface-v1.clar` | Granite Protocol | Collateral management, borrowing stablecoins |

## Protocol Flows

### Deposit Flow
```
User deposits sBTC → vault.deposit() → blacklist + state validate (enabled, cap, minimum)
                                     → sBTC transferred to reserve
                                     → state updates total-assets, mints hBTC shares to user
```

### Redeem Flow (3-step process)
```
1. request-redeem(shares, is-express) → Escrows hBTC in vault, creates claim with cooldown
2. fund-claim(claim-id)               → Manager (anytime) or caller (after cooldown)
                                        Locks share price, burns shares, moves sBTC to vault
3. redeem(claim-id)                   → After cooldown, transfers sBTC (minus exit fee) to user
```

### Reward Flow (Yield Distribution)
```
Rewarder calls controller.log-reward(amount, is-positive)
  → Positive: Management + performance fees deducted, net reward increases total-assets, share price rises
  → Negative: Reserve fund covers loss first, share price drops only if reserve insufficient
```

### Trading Flow (DeFi Integration)
```
Open Position:  zest-add-open() → Add sBTC collateral → Borrow USDh → Stake in Hermetica
Close Position: zest-close-remove() → Unstake sUSDh → Repay loan → Remove collateral
```

## Quick Start

### Prerequisites
- [Clarinet](https://github.com/stx-labs/clarinet) - Clarity development environment
- [Clarigen](https://github.com/mechanismHQ/clarigen) - TypeScript type generator
- Node.js v18+
- [Hiro API Key](https://platform.hiro.so/) - Required for mainnet fork testing

### Setup
```bash
npm install
npm run clarigen  # Generate TypeScript types
```

### Environment Variables
The tests require a Hiro API key to access mainnet fork data:

```bash
export HIRO_API_KEY=your_api_key_here
```

Get your free API key at https://platform.hiro.so/

### Run Tests
```bash
npm test                                    # Run all tests
npm test -- tests/hbtc/                     # Run hBTC tests only
npm test -- tests/hbtc/vault.test.ts        # Run specific test file
npm test -- -t "should successfully"        # Run tests matching pattern
```

## Test Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `vault.test.ts` | 45 | Deposit, request-redeem, fund-claim, redeem, cancel, express |
| `controller.test.ts` | 20 | Log-reward (positive/negative), rate limiting, edge cases |
| `trading.test.ts` | 16 | Open/close positions, Zest+Hermetica integration |
| `zest-interface.test.ts` | 24 | Collateral add/remove, borrow/repay, vault operations |
| `hermetica-interface.test.ts` | 10 | Stake/unstake/withdraw, sweep, authorization |

### Happy Path Tests

**Vault Flow (Deposit → Fund-claim → Redeem):**
- Full standard redemption flow (3-day cooldown)
- Full express redemption flow (4-hour cooldown)
- Multiple deposits and partial redemptions

**Controller Log-Rewards:**
- Positive reward increases total-assets
- Loss covered by reserve fund
- Loss causes price drop when reserve insufficient

**Trading (Open → Close Position):**
- Add collateral, borrow USDh, stake in Hermetica
- Unstake sUSDh, repay loan, remove collateral

## Test Helpers

The test setup (`tests/helpers/setup.ts`) provides:

### Pre-configured Roles

| Role | Wallet | Purpose |
|------|--------|---------|
| Owner | deployer | Contract owner, timelocked role changes |
| Guardian | wallet_2 | Emergency pause |
| Trader | wallet_3 | Trading operations |
| Rewarder | wallet_4 | Log rewards |
| Manager | wallet_5 | Fund claims early |
| User 1-3 | wallet_6-8 | Test users for deposits/redemptions |

### Utilities
- `txOk(call, sender)` - Execute transaction expecting success
- `txErr(call, sender)` - Execute transaction expecting error
- `rov(call)` - Read-only function call
- `rovOk(call)` - Read-only function call expecting ok
- `filterEvents(events)` - Filter transaction events
- `mineBlocks(n)` - Advance blockchain by n blocks

### Constants
- `ONE_BTC = 100_000_000n` (8 decimals)
- `ONE_USDH = 100_000_000n` (8 decimals)
- `SHARE_BASE = 100_000_000n`
- Standard cooldown: 259,200 seconds (3 days)
- Express cooldown: 14,400 seconds (4 hours)

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 101001 | NOT_OWNER | Caller is not contract owner |
| 101003 | NOT_GUARDIAN | Caller lacks guardian role |
| 101004 | NOT_TRADER | Caller lacks trader role |
| 101005 | NOT_REWARDER | Caller lacks rewarder role |
| 101006 | NOT_MANAGER | Caller lacks manager role |
| 101007 | NOT_FEE_SETTER | Caller lacks fee-setter role |
| 101008 | NOT_PROTOCOL | Caller lacks protocol role |
| 101013 | TIMELOCK | Timelock period not elapsed |
| 102005 | DEPOSIT_DISABLED | Deposits are paused |
| 102006 | REDEEM_DISABLED | Redemptions are paused |
| 102022 | REWARD_DISABLED | Reward logging is disabled |
| 103001 | DEPOSIT_CAP_EXCEEDED | Would exceed deposit cap |
| 103002 | BELOW_MIN | Amount below minimum |
| 103004 | NOT_COOLED_DOWN | Cooldown period not elapsed |
| 103005 | ALREADY_FUNDED | Claim already funded |
| 103006 | NOT_FUNDED | Claim not yet funded |
| 103008 | NOT_AUTHORIZED | Not claim owner |
| 104001 | ZERO_ONLY_POSITIVE | Zero amount only valid for positive rewards |
| 104002 | INSUFFICIENT_FUNDS | Insufficient funds for operation |
| 108002 | SOFT_BLACKLISTED | Address is soft-blacklisted |
| 108003 | FULLY_BLACKLISTED | Address is fully-blacklisted |
| 120001 | TRADING_INVALID_AMOUNT | Trading amount is zero or invalid |

See `tests/helpers/setup.ts` for the complete error code mapping.

## Testing Architecture

Tests run directly against the **production contracts** in `mainnet/contracts/` — Protocol initialization is performed in `tests/helpers/setup.ts` using the same timelocked request/confirm governance flows used on-chain:
- Roles are assigned via `requestXxxUpdate` → mine past timelock → `confirmXxxRequest`
- Assets and externals are registered via `requestAssetAdd`/`requestExternalAdd` → confirm
- State variables (deposit cap, express settings) are configured via owner calls

## Mainnet Fork Testing

Tests run against a **mainnet fork** at block height 6316137, enabling:
- Real Zest Protocol v2 market integration
- Real Hermetica USDh staking contracts
- Pyth oracle price feeds
- DIA oracle for USDh pricing

This allows testing actual cross-protocol interactions without mocking.
