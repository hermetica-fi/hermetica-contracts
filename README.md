# Hermetica hBTC Protocol

Hermetica hBTC is a Bitcoin yield vault written in Clarity with ERC-4626-style share mint/redeem, daily NAV updates, and strategy execution via external protocol integrations.

### 🌐 mainnet/
Production deployment information including:
- Contract addresses on Stacks mainnet
- Explorer links

**[View Mainnet Deployment →](mainnet/README.md)**

### 🧪 local-testing/
**For Security Researchers:**
- Complete test suite with 80+ tests across vault, controller, trading, and interface contracts
- Mainnet fork testing with real Zest and Hermetica integrations
- Protocol initialization reference with pre-configured roles
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

## Architecture

```
                    ┌──────────────────────────────┐
                    │        vault.clar            │
                    │   (Deposit/Redeem Engine)    │
                    │                              │
                    │  • Share minting/burning     │
                    │  • Claim lifecycle           │
                    │  • Cooldown enforcement      │
                    └──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      ┌─────────┐        ┌───────────┐      ┌──────────┐
      │ state   │        │controller │      │ reserve  │
      │         │        │           │      │          │
      │ Caps,   │        │ Rewards,  │      │ Holds    │
      │ Shares, │        │ Fees,     │      │ sBTC     │
      │ Assets  │        │ Price     │      │          │
      └─────────┘        └───────────┘      └──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      ┌─────────┐        ┌─────────┐        ┌──────────┐
      │  hq     │        │ trading │        │  fee-    │
      │         │        │         │        │collector │
      │ Roles,  │        │ Atomic  │        │          │
      │Timelock │        │ DeFi    │        │ Collects │
      │         │        │ Flows   │        │ Fees     │
      └─────────┘        └─────────┘        └──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      ┌───────────┐      ┌───────────┐      ┌───────────┐
      │   zest-   │      │ hermetica-│      │ granite-  │
      │ interface │      │ interface │      │ interface │
      │           │      │           │      │           │
      │ Borrow/   │      │ Stake/    │      │ Borrow    │
      │ Lend      │      │ Unstake   │      │           │
      └───────────┘      └───────────┘      └───────────┘
```

## Core Components

| Contract | Purpose |
|----------|---------|
| `vault-v1.clar` | Core deposit/redeem logic, claim management |
| `controller-v1.clar` | Reward distribution, fee accounting, reserve fund loss handling |
| `state-v1.clar` | Protocol state (caps, cooldowns, assets, share tracking) |
| `hq-v1.clar` | Role-based access control with timelock |
| `reserve-v1.clar` | Holds protocol assets (sBTC) |
| `reserve-fund-v1.clar` | Loss absorption buffer |
| `fee-collector-v1.clar` | Collects and distributes fees |
| `blacklist-v1.clar` | Address restriction management |
| `trading-v1.clar` | Atomic DeFi position management |
| `hbtc-token.clar` | SIP-010 hBTC token (shares) |

## External Interfaces

| Contract | Integration | Purpose |
|----------|-------------|---------|
| `zest-interface-v1.clar` | Zest Protocol v2 | Collateral management, borrowing stablecoins |
| `hermetica-interface-v1.clar` | Hermetica USDh | Stake/unstake sUSDh for yield, mint/redeem USDh |
| `granite-interface-v1.clar` | Granite Protocol | Collateral management, borrowing stablecoins |

## Protocol Flows

### Deposit Flow
```
User deposits sBTC → vault.deposit() → controller validates → state updates shares
                                                           → reserve holds sBTC
                                                           → hbtc-token mints shares to user
```

### Redeem Flow (3-step process)
```
1. request-redeem(shares, is-express) → Creates claim with cooldown timestamp
2. fund-claim(claim-id)               → Manager (anytime) or User (after cooldown) - Burns shares
3. redeem(claim-id)                   → Transfers sBTC to user
```

### Reward Flow (Yield Distribution)
```
Rewarder calls log-reward(amount, is-positive)
  → Positive: Fees allocated, total-assets increases, share price rises
  → Negative: Reserve fund covers first, then price drops if insufficient
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
cd local-testing
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
| `vault.test.ts` | 22 | Deposit, request-redeem, fund-claim, redeem, cancel, express |
| `controller.test.ts` | 10 | Log-reward (positive/negative), rate limiting, edge cases |
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

The test setup (`local-testing/tests/helpers/setup.ts`) provides:

### Pre-configured Roles

| Role | Wallet | Purpose |
|------|--------|---------|
| Owner | deployer | Contract owner, can change roles |
| Admin | wallet_1 | Set caps, enable features |
| Guardian | wallet_2 | Emergency pause |
| Trader | wallet_3 | Trading operations |
| Rewarder | wallet_4 | Log rewards |
| Manager | wallet_5 | Fund claims early |

### Utilities
- `txOk(call, sender)` - Execute transaction expecting success
- `txErr(call, sender)` - Execute transaction expecting error
- `rov(call)` - Read-only function call
- `mineBlocks(n)` - Advance blockchain by n blocks

### Constants
- `ONE_BTC = 100_000_000n` (8 decimals)
- `ONE_USDH = 100_000_000n` (8 decimals)
- `SHARE_BASE = 100_000_000n`
- Standard cooldown: 3 days (~25,920 blocks)
- Express cooldown: 4 hours (~1,440 blocks)

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 101006 | NOT_REWARDER | Caller lacks rewarder role |
| 101007 | NOT_MANAGER | Caller lacks manager role |
| 101008 | NOT_TRADER | Caller lacks trader role |
| 102005 | DEPOSIT_DISABLED | Deposits are paused |
| 102021 | REWARD_DISABLED | Reward logging is disabled |
| 103001 | DEPOSIT_CAP_EXCEEDED | Would exceed deposit cap |
| 103002 | BELOW_MIN | Amount below minimum |
| 103004 | NOT_COOLED_DOWN | Cooldown period not elapsed |
| 103005 | ALREADY_FUNDED | Claim already funded |
| 103006 | NOT_FUNDED | Claim not yet funded |
| 103008 | NOT_AUTHORIZED | Not claim owner |
| 104001 | ZERO_ONLY_POSITIVE | Zero amount only valid for positive rewards |
| 105001 | INSUFFICIENT_BALANCE | Reserve has insufficient balance |
| 108002 | SOFT_BLACKLISTED | Address is soft-blacklisted |
| 108003 | FULLY_BLACKLISTED | Address is fully-blacklisted |
| 120001 | INVALID_AMOUNT | Trading amount is zero or invalid |
| 120002 | INVALID_TOKEN | Token doesn't match expected (e.g., not USDh) |

See `tests/helpers/setup.ts` for the complete error code mapping.

## Local Testing vs Mainnet

This environment uses **modified contracts** with embedded initialization to:
- Pre-configure roles (bypasses timelock delays)
- Pre-register sBTC and other assets
- Set custom cooldowns for instant withdrawal testing
- Enable fast test iteration

**Production contracts** in `../mainnet/` are untouched and require proper initialization flows.

## Mainnet Fork Testing

Tests run against a **mainnet fork** at block height 6316137, enabling:
- Real Zest Protocol v2 market integration
- Real Hermetica USDh staking contracts
- Pyth oracle price feeds
- DIA oracle for USDh pricing

This allows testing actual cross-protocol interactions without mocking.
