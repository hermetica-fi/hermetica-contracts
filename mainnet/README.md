# Audit reports

## hBTC

| Date | Auditor | Report PDF | Init commit hash |
| ----------- | ------ | --------- | -------- |
| 01/2026 | [Clarity Alliance](https://www.clarityalliance.org/reports/hermetica-vaults) | [hBTC Vaults](https://2201013687-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fxp26OjT5H1o55M1QMDI4%2Fuploads%2Fz6sXMobZdjJnWSset9Kj%2FHermetica%20x%20Clarity%20Alliance%20-%20Audit%20Report%20Jan2026.pdf?alt=media&token=0f26dbe9-6189-4f72-a9fd-a505276feb7f) | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/43fff97fdecd8c3a2c2fc5b6070967fad4aac28f) |
| 11/2025 | [Greybeard Security](https://github.com/greybeard-security/audit-reports) | [hBTC Vaults](https://2201013687-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fxp26OjT5H1o55M1QMDI4%2Fuploads%2FACnCzgFKXCPj7rtBsNqy%2FHermetica%20x%20Greybeard%20-%20Audit%20Report%20Nov2025.pdf?alt=media&token=9ebe8612-084e-4b49-846d-262049dc3950) | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/7ceb2b6adf7b59510684428bcd8c4d07d051c627) |

### hBTC Vaults Remediations (Clarity Alliance - 01/2026)

| ID | Title | Severity | Status |
| ------ | --------------------------------------------- | -------- | ----------- |
| H-01 | Incorrect Performance Fee Calculation Leads To Unaccounted Rewards | High | Resolved |
| H-02 | Reward Profit Handling Is Incorrect | High | Resolved |
| H-03 | Excess Loss Handling Is Incorrect | High | Resolved |
| H-04 | Covered Loss Handling Is Incorrect | High | Resolved |
| M-01 | Vault Withdrawal Share Rounding Favors Users Over the Protocol | Medium | Resolved |
| M-02 | Malicious Trader Can Drain Removable Zest Collateral | Medium | Resolved |
| M-03 | Premature Share Price Snapshot Leads to Unbacked Pending Claims | Medium | Resolved |
| M-04 | Vault Cannot Be Emptied After Share Price Divergence | Medium | Resolved |
| M-05 | Updated Management And Performance Fees Are Applied Retroactively | Medium | Resolved |
| M-06 | hBTC Token Is Not SIP-10 Compliant | Medium | Resolved |
| M-07 | hBTC Public Share Burning Enables a First-Deposit DoS Attack Variant | Medium | Resolved |
| M-08 | Maximum and Minimum Cap Limitations May Endanger the Protocol | Medium | Resolved |
| M-09 | Tokens With tx-sender-Based Authorization Are Not Fully Supported | Medium | Resolved |
| M-10 | STX Integration Issues Due to Clarity 4 Security Constraints | Medium | Resolved |
| L-01 | Incomplete Blacklist Flow | Low | Acknowledged |
| L-02 | Missing Reset Mechanism for Custom Parameters | Low | Resolved |
| L-03 | Management Fee Overstated by Using Total Assets | Low | Resolved |
| L-04 | Missing Explicit Validation for is-express Parameters | Low | Resolved |
| L-05 | Vault withdraw-many Functionality Is Brittle | Low | Resolved |
| L-06 | hBTC Token Name Should Not Be Changeable | Low | Partially Resolved |
| L-07 | Reward Distribution Should Not Be Allowed After the Vault Has Been Emptied | Low | Resolved |
| L-08 | Positive Slippage Remains in the Hermetica Interface Contract After a Mint | Low | Resolved |
| L-09 | Race Condition During Fund Transfers Due to Rewarder Role Ambiguity | Low | Resolved |
| L-10 | Admin Should Not Be Able To Change Price Staleness Threshold | Low | Resolved |
| L-11 | Exit Fee Transfers Should Not Be Bound To Vault Status | Low | Resolved |
| L-12 | Missing Transfer Authorization Check in Reserve Fund Transfer | Low | Resolved |
| L-13 | Max Slippage Can Be Set for Arbitrary Assets | Low | Resolved |
| L-14 | Security Enhancements in Case of Ownership Compromise | Low | Resolved |
| L-15 | Unnecessary Token Allowance on Zest Operations With No Outflows | Low | Resolved |
| L-16 | Repaying Zest Debt May Leave Dust in the Interface | Low | Resolved |
| L-17 | Loose Token Allowances on Zest Market Interface Calls | Low | Resolved |
| QA-01 | Unnecessary External Call for is-standard Verification | QA | Acknowledged |
| QA-02 | Current Owner Can Claim Ownership Multiple Times | QA | Resolved |
| QA-03 | Current Owner Can Request Next Ownership to Himself | QA | Resolved |
| QA-04 | Incorrect Reuse of ERR_NOT_OWNER Code When Claiming Ownership | QA | Resolved |
| QA-05 | Incorrect Event Action Name for request-new-admin Function | QA | Resolved |
| QA-06 | Optimize Double Timestamp Retrieval | QA | Resolved |
| QA-07 | Hardcode Constants Instead of Computing at Runtime | QA | Resolved |
| QA-08 | Zest Interface Contract Can Be Slightly Improved | QA | Resolved |
| QA-09 | Excessive Price Feed Updates in Trading Interface | QA | Resolved |
| QA-10 | Trading Interface: Ambiguous Function Naming Convention | QA | Resolved |
| QA-11 | Trading Interface Can Be Optimized | QA | Resolved |
| QA-12 | Vault Deposit Cap Consideration | QA | Resolved |
| QA-13 | Management Fee Max Amount Implementation - Documentation Discrepancy | QA | Resolved |
| QA-14 | Vault Contract Can Be Slightly Improved | QA | Resolved |
| QA-15 | First Depositor Inflation Attack Considerations | QA | Resolved |
| QA-16 | Add Vault Action Preview Functions | QA | Resolved |
| QA-17 | Codebase Print Statements Improvements | QA | Resolved |
| QA-18 | Miscellaneous Codebase Improvements | QA | Resolved |
| QA-19 | Hermetica Interface Mint Asset Transfer Restriction Can Be Improved | QA | Resolved |
| QA-20 | Use the Recipient Feature of the Zest Market Interface | QA | Resolved |
| QA-21 | Use Zest Market Bundle Operations | QA | Resolved |

### hBTC Vaults Remediations (Greybeard Security - 11/2025)

| ID | Title | Severity | Status |
| ------ | --------------------------------------------- | -------- | ----------- |
| M-1 | Blacklisting should be handled at the level of the hBTC token | Medium | Resolved |
| M-2 | Lack of mechanism to cancel claim requests | Medium | Resolved |
| M-3 | Blacklist can be bypassed in a certain scenario | Medium | Resolved |
| L-1 | Blacklist should also be checked in redeem-internal | Low | Resolved |
| L-2 | The trading-v1 contracts do not check usdh-token-trait | Low | Resolved |
| L-3 | Activation delay can be bypassed | Low | Resolved |
| L-4 | process-claim should not allow zero assets claims | Low | Resolved |
| L-5 | Rounding direction of convert-to-shares is in favour of user not protocol | Low | Resolved |
| L-6 | Precision loss allows for a share price increase after funding a claim | Low | Resolved |
| I-1 | controller-v1.handle-profit doesn't use or require is-positive parameter | Informational | Resolved |
| I-2 | handle-loss-covered/exceeds can be simplified | Informational | Resolved |
| I-3 | zest-close can repay less than expected | Informational | Resolved |
| I-4 | sbtc's get-balance does not return available balance | Informational | Acknowledged |
| I-5 | zest-deposit and zest-redeem refactor | Informational | Resolved |
| I-6 | Remove unnecessary calls to as-contract | Informational | Resolved |
| I-7 | Consider minimum redeem sizes to avoid potential attacks based on small amounts | Informational | Resolved |
| I-8 | Inequivalence between fund-claim and fund-claim-many | Informational | Resolved |

## USDh

| Date | Auditor | Report PDF | Init commit hash |
| ----------- | ------ | --------- | -------- |
| 09/2025 | [Clarity Alliance](https://www.clarityalliance.org/hermetica-usdh-upgrade) | [Staking-v1-1](https://clarity-alliance.github.io/audits/Clarity%20Alliance%20-%20Hermetica%20USDh%20(Upgrade).pdf)| [Link](https://github.com/hermetica-fi/hermetica-contracts/commit/1b9a84f91204ed326952d0d1e0adc464df5c7a52) |
| 03/2025 | [Clarity Alliance](https://www.clarityalliance.org/hermeticaminting) | [Minting-auto](https://github.com/Clarity-Alliance/audits/blob/main/Clarity%20Alliance%20-%20Hermetica%20USDh%20Minting%20Contract.pdf)| [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/2d51015b223b844f9c3ed026669a97b1b594d41b) |
| 06/2024 | [StrataLabs](https://www.stratalabs.org/) | [USDh protocol](https://2201013687-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fxp26OjT5H1o55M1QMDI4%2Fuploads%2FsxllbdrJOMTz2f6U8MRR%2FHermetica%20x%20StrataLabs%20-%20Audit%20Report.pdf?alt=media&token=b906f43e-aebc-4d96-a050-223689442378) | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/83c3cad999b6797e68527ecbccbba34b2bdd2611) |
| 06/2024 | [Clarity Alliance](https://www.clarityalliance.org/hermetica) | [USDh protocol](https://github.com/Clarity-Alliance/audits/blob/main/Clarity%20Alliance%20-%20Hermetica.pdf) | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/83c3cad999b6797e68527ecbccbba34b2bdd2611) |

## Staking-v1-1 Upgrade Remediations (Clarity Alliance - 09/2025)

| ID     | Title                                         | Severity | Status      | Github PR |
| ------ | --------------------------------------------- | -------- | ----------- | ----------- |
| H-01   | Different Staking Contract Versions Design Flaw Skews USDh/sUSDh Conversion Ratio | High     | Resolved    |             |
| L-01   | Staking State Contract Authorization Ambiguities | Low      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/40) |
| QA-01  | Claim With Zero Tokens Should Not Be Valid   | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/39) |
| QA-02  | Redundant Tuples With Single Element as Map Key Or Value | QA       | Acknowledged |             |
| QA-03  | No Affiliate Validation                      | QA       | Acknowledged |             |
| QA-04  | Staking Cannot Be Paused Separately From Unstaking | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/37) |
| QA-05  | Unstaking Can Be Simplified                  | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/38) |


### Additional PRs part of the audit

| Title                                         | Github PR |
| --------------------------------------------- | --------- |
| fix: restrict staking-reserve transfers to minting contracts only    | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/36) |
| fix: deprecated next-claim-id in staking-silo         | [Link](https://github.com/hermetica-fi/hermetica-contracts/pull/41) |

## Minting-auto Remediations (Clarity Alliance - 03/2025)

| ID     | Title                                         | Severity | Status      | Commit Hash |
| ------ | --------------------------------------------- | -------- | ----------- | ----------- |
| H-01   | Deprecated Pyth Oracle Version Is Used        | High     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/f260f0d7cfec580f81c20e71064d42aea03fca69) |
| H-02   | Hardcoded Pyth Price Exponent                 | High     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/c610ecb87cd1f24a8d7aa4c28f68c2f6967cc7af) |
| M-01   | Pyth Price Confidence Is Not Validated        | Medium   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/2f9dc50d04815c1bdfc33fbe62d213167ca0b967) |
| M-02   | Redeeming Incorrectly Consumes Minting Allowance | Medium   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/29629413a5c355d904ac53812fd9bfc8aac6f431) |
| L-01   | Avoid Using tx-sender for Caller Identification | Low      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/cd140d080b19277ed3a0754cc8e88aaac9a1ac9f) |
| QA-01  | Absence of Events for Critical Actions        | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/091e1a5aaecf20a69ee56b893eab29c8d8c131c8) |
| QA-02  | Typographical Error                           | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/43dd97c8f312947895bc81d158934e75ff60ed38) |
| QA-03  | Redundant Tuple with a Single Element as Map Key | QA       | Acknowledged |             |
| QA-04  | Simplification of set-supported-asset         | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/1515a2b24cd4f000466350710346c0895ac14a07) |
| QA-05  | Implement Standard Checks for All Saved Principals | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/1aca5e7410ed90403850b0f2196ef33fac1ff4f8) |
| QA-06  | Unused Redeem Memo Argument                   | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/85b0a159438880e5887d5bd16cbc9a1c21a9ac26) |
| QA-07  | Missing Required USDh Amount Validation       | QA       | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/3941efa6daa0a1aba50f40066c6d2014cf5ff587) |
| QA-08  | Slippage Mechanism Is Ineffective Against Price Fluctuations | QA       | Acknowledged | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/a013a6c15cb7a1c91b19da73e809bcc4caf92dc8) |

## USDh Protocol Remediations (StrataLabs - 06/2024)

Below is a summary & list of all priority (0 - 3) issues found throughout an independent or
paired review session. 

- **P0:** has a high certainty in loss of protocol | user funds
- **P1:** has a low probability through events such as admin accidents | governance exploits
- **P2:** is highly recommend
- **P3:** optional (usually syntax/optimization based)

| Title                                         | Severity | Location                              | Category           | Status      | Remediation Link                                                                    |
| --------------------------------------------- | -------- | ------------------------------------- | ------------------ | ----------- | ----------------------------------------------------------------------------------- |
| Possible custodial mint replay (Use map-insert for mint/redeem-request)  | P1       | minting-otc-v1          | Input Validation   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/981a94edb25b433c183641a9e1ea0b92402836f3)  |
| No Receiver Check Withdrawing From insurance-fund | P1       | insurance-fund-v1   | Access Control     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/774219ba828dfb3e14d1f2c7e5a60fed34016a6c) |
| No Receiver Check Withdrawing From reserve-v1   | P1       | reserve-v1      | Access Control     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/4747010122da6580e5bbff1fb7fd779d8b8d82b6) |
| No Receiver Check Withdrawing From staking-reserve-v1 | P1       | staking-reserve-v1       | Access Control     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/45858e71022b038320d87316afc7521b0ddfd0bb) |
| Off-chain To On-Chain Data Verification       | P1       | minting-otc-v1       | Input Validation   | Acknowledged |                                                                                     |
| Possible (log-pnl …) Breakage                | P2       | controller-v1   | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/774219ba828dfb3e14d1f2c7e5a60fed34016a6c) |
| Lack of Centralized State / Storage           | P2       | protocol architecture       | Arquitecture      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/4747010122da6580e5bbff1fb7fd779d8b8d82b6) |
| Unnecessarily Holding Onto Staked Liquidity   | P2       | staking-v1; staking-reserve-v1       | Arquitecture      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/45858e71022b038320d87316afc7521b0ddfd0bb) |
| Let instead of (begin …)                      | P3       | controller-v1     | Gas Optimization   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/774219ba828dfb3e14d1f2c7e5a60fed34016a6c) |
| Unnecessary (begin …)                         | P3       | usdh-token-v1      | Gas Optimization   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/commit/5caee930705c7f5eacbb03a7d6c731f986f03026) |


## USDh Protocol Remediations (Clarity Alliance - 06-2024)

| Title                                                               | Severity | Location                                                                     | Category           | Status      | Remediation Link                                                                  |
| ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- | ------------------ | ----------- | --------------------------------------------------------------------------------- |
| Reversed slippage check renders `confirm-redeem` useless             | Critical | minting-v1                                                      | Input Validation   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/1)                   |
| First depositor attack                                              | High     | staking-v1                                                     | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/17)                  |
| Can create mint requests guaranteed to fail                         | Medium   | minting-v1                                                    | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/4)                   |
| Fractional fee structure is not practical                          | Medium   | minting-v1                              | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/5)                   |
| Mint limit DoS                                                      | Medium   | minting-v1                      | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/19)                  |
| Not updating `last-oracle-timestamp` in `reset-mint-window`          | Medium   | minting-v1                     | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/3)                   |
| reset-mint-window doesn't perform staleness checks                   | Medium   | minting-v1                       | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/6)                   |
| `mint-limit-reset-window` is 1 block bigger, lowering OTC minting rates | Low      | minting-otc-v1                     | Math               | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/7)                   |
| Missing functionality to set soft-blacklist-enabled                 | Low      | blacklist-susdh-v1    | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/10)                  |
| The soft blacklist check which prevents staking and unstaking can be escaped | Low      | staking-v1                     | Input Validation   | Acknowledged |                                                                                 |
| recover-susdh always checks for full blacklist even when blacklist-enabled is set as false | Low      | recover-v1                | Input Validation   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/11)                  |
| Ownership of hq can be forever lost due to missing safe guard        | Low      | hq-v1             | Access Control     | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/18)                  |
| Unused functionality in minting-otc as the system doesn't do asset commission when confirming a mint. | QA       | minting-otc-v1 | Logical Error      | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/8)                   |
| The functions confirm-mint, confirm-redeem don't check if the asset is still active | QA       | minting-v1                | Input Validation   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/9)                   |
| Remove unnecessary variables                                        | QA       | minting-v1                                     | Gas Optimization   | Resolved    | [Link](https://github.com/hermetica-fi/hermetica-usdh-contracts/pull/13)                  |


## Deployment and Security Considerations

### hBTC Vault First Depositor Attack Mitigation

Smart contract vaults are subject to a known class of attacks where the first depositor can manipulate the share price through inflation. This enables attackers to extract value from subsequent depositors via a [known variation of the first depositor attack](https://x.com/kankodu/status/1771229163942474096) that applies even when the vault accounts for direct deposits.

**Attack Mechanism**: Through repetitive, cleverly chosen dust deposits and withdrawals, an attacker can exponentially inflate the shares-to-asset ratio such that 1 unit of shares becomes vastly more valuable. This allows future deposits to round down significantly, with the attacker collecting the rounded-down amounts.

**Mitigation**: The hBTC vault design includes a maximum price divergence mechanism that makes this attack economically unfeasible. However, to completely eliminate any potential rounding edge cases, the following deployment procedure must be executed.

#### Required Deployment Procedure

**After vault contract deployment, execute the following steps:**

1. Have the deployment team deposit an initial amount of assets into the vault
2. Transfer dust shares (e.g., 1000 LP nano units) to an inaccessible burn address: `SP000000000000000000002Q6VF78`
3. These shares will never be burned or redeemed, ensuring the vault is never completely empty

This procedure ensures that the vault always maintains a minimum share balance, preventing any first depositor from becoming the sole liquidity provider and eliminating rounding vulnerabilities.

**Note**: This is a one-time operation that must be performed immediately after deployment and before the vault is opened to public deposits.

## Documentation

- https://docs.hermetica.fi/
