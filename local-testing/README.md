# Hermetica hBTC Protocol - Local Testing Environment

**For Security Researchers:**
Minimal simnet environment with example test templates to help you get started. Includes Clarity contracts with embedded initialization for fast testing, protocol flow examples, and TypeScript types via Clarigen.

## Quick Start

### Prerequisites
- [Clarinet](https://github.com/stx-labs/clarinet) - Clarity development environment
- [Clarigen](https://github.com/mechanismHQ/clarigen) - TypeScript type generator for Clarity
- Node.js v18+

### Setup
```bash
cd local-testing
npm install
npm run clarigen  # Generate TypeScript types
```

### Run Tests
```bash
npm test                        # Run all tests
npm test -- tests/hbtc/         # Run hBTC tests only
npm test -- -t "deposit"        # Run specific test pattern
```

## Example Tests

Starter test templates to help you build your own security tests:

### Core Flow Tests (23 tests across 3 files)

1. **Deposit Flow** (`tests/hbtc/deposit.test.ts`) - 6 tests
   - Happy path deposits at 1:1 share ratio
   - Deposit cap enforcement
   - Minimum deposit validation
   - Blacklist restrictions (soft and full)

2. **Redeem Flow** (`tests/hbtc/redeem.test.ts`) - 13 tests
   - Request redeem lifecycle
   - Fund claim mechanics (manager vs user timing)
   - Cooldown period enforcement (3 days standard, 4 hours express)
   - Cancel redeem restrictions
   - Express redemption flow

3. **Log Reward Flow** (`tests/hbtc/log-reward.test.ts`) - 4 tests
   - Positive/negative reward logging
   - Authorization checks (rewarder role)
   - Reward-enabled flag validation

Use these as a base to develop comprehensive test suites for your security research.

## Architecture

**hBTC Protocol** is a yield-bearing Bitcoin wrapper on Stacks. Users deposit sBTC and receive hBTC shares representing their position.

### Key Contracts

| Contract | Purpose |
|----------|---------|
| `vault-v1.clar` | Core deposit/redeem logic, claim management |
| `controller-hbtc-v1.clar` | Orchestrates vault operations, share price calculation |
| `state-v1.clar` | Protocol state (caps, cooldowns, assets, share tracking) |
| `hq-v1.clar` | Role-based access control with timelock |
| `reserve-v1.clar` | Holds protocol assets (sBTC) |
| `reserve-fund-v1.clar` | Secondary reserve for protocol operations |
| `fee-collector-v1.clar` | Collects and distributes fees |
| `blacklist-v1.clar` | Address restriction management |
| `trading-v1.clar` | Trading interface for yield strategies |
| `hbtc-token.clar` | SIP-010 hBTC token (shares) |

### External Interfaces

| Contract | Purpose |
|----------|---------|
| `zest-interface-v1.clar` | Integration with Zest Protocol |
| `hermetica-interface-v1.clar` | Integration with Hermetica USDh |
| `granite-interface-v1.clar` | Integration with Granite Protocol |

## Protocol Flows

### Deposit Flow
```
User -> vault.deposit(amount) -> controller -> state (update shares/assets) -> reserve (hold sBTC) -> hbtc-token (mint shares)
```

### Redeem Flow (3-step process)
```
1. User -> vault.request-redeem(shares, is-express) -> Creates claim with cooldown
2. Manager/User -> vault.fund-claim(claim-id) -> Processes claim, moves assets to vault
3. User -> vault.redeem(claim-id) -> Transfers assets to user, burns shares
```

### Reward Flow
```
Rewarder -> controller.log-reward(amount, is-positive) -> state (adjust total-assets) -> Share price changes
```

## Test Helpers

The test setup (`tests/helpers/setup.ts`) provides:

- **Pre-configured roles**: admin, guardian, trader, rewarder, manager
- **Test users**: user1, user2, user3 with sBTC funding
- **Protocol constants**: SHARE_BASE, BPS_BASE, ONE_BTC, cooldown periods
- **Error codes**: Mapped error constants for assertions
- **Utilities**: `txOk`, `txErr`, `rov`, `mineBlocks`

### Role Assignments (pre-configured in contracts)

| Role | Wallet | Purpose |
|------|--------|---------|
| Owner | deployer | Contract owner, can change roles |
| Admin | wallet_1 | Set caps, enable features |
| Guardian | wallet_2 | Emergency pause |
| Trader | wallet_3 | Trading operations |
| Rewarder | wallet_4 | Log rewards |
| Manager | wallet_5 | Fund claims early |

## Local Testing vs Mainnet

This environment uses **modified contracts** with embedded initialization to:
- Pre-configure roles (bypasses timelock delays)
- Pre-register sBTC asset
- Enable fast test iteration

**Production contracts** in `../mainnet/` are untouched and require proper initialization flows.

## Error Codes

Common errors you'll encounter:

| Code | Name | Description |
|------|------|-------------|
| 101006 | NOT_REWARDER | Caller lacks rewarder role |
| 101007 | NOT_MANAGER | Caller lacks manager role |
| 102005 | DEPOSIT_DISABLED | Deposits are paused |
| 102021 | REWARD_DISABLED | Reward logging is disabled |
| 103001 | DEPOSIT_CAP_EXCEEDED | Would exceed deposit cap |
| 103002 | BELOW_MIN | Amount below minimum |
| 103004 | NOT_COOLED_DOWN | Cooldown period not elapsed |
| 103005 | ALREADY_FUNDED | Claim already funded |
| 103008 | NOT_AUTHORIZED | Not claim owner |
| 108002 | SOFT_BLACKLISTED | Address is soft-blacklisted |
| 108003 | FULLY_BLACKLISTED | Address is fully-blacklisted |

See `tests/helpers/setup.ts` for the complete error code mapping.

## Bug Bounty

**Submit reports via Immunefi:** https://immunefi.com/bug-bounty/hermetica/

For security research, focus on:
- Authorization bypasses
- Share price manipulation
- Cooldown circumvention
- Asset theft vectors
- Blacklist evasion
