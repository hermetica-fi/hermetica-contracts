;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Trading
;; @version 1
;; @description Batched and atomic position management across DeFi protocols

(use-trait ft 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.ft-trait.ft-trait)
(use-trait zest-market 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.market-trait.market-trait)
(use-trait zest-vault 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.vault-traits.tokenized-vault)
(use-trait hbtc-vault-trait .vault-trait-v1.vault-trait)
(use-trait staking-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-trait-v1.staking-trait)
(use-trait staking-silo-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-trait-v1.staking-silo-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u120001))
(define-constant ERR_INVALID_TOKEN (err u120002))

(define-constant usdh-token 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1)

(define-public (zest-open
  (market <zest-market>) (staking <staking-trait>)
  (borrow-token <ft>)
  (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)

    (try! (contract-call? .zest-interface zest-borrow market borrow-token borrow-amount price-feed-1 price-feed-2))

    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))
    (print { action: "zest-open", user: contract-caller, data: { market: market, staking: staking, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

(define-public (zest-close
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>)
  (repay-token <ft>)
  (unstake-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (let (

      (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo))))

      (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)

      (try! (contract-call? .zest-interface zest-repay market repay-token repay-amount price-feed-1 price-feed-2))

      (print { action: "zest-close", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount } } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Open Position - Direct Path
;;-------------------------------------

(define-public (zest-add-open
  (market <zest-market>) (staking <staking-trait>) (collateral-token <ft>) (borrow-token <ft>)
  (collateral-amount uint) (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    (try! (contract-call? .zest-interface zest-collateral-add market collateral-token collateral-amount price-feed-1 price-feed-2))

    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)

    (try! (contract-call? .zest-interface zest-borrow market borrow-token borrow-amount none none))

    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))

    (print { action: "zest-add-open", user: contract-caller, data: { market: market, staking: staking, collateral: { token: collateral-token, amount: collateral-amount }, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position - Direct Path
;;-------------------------------------

(define-public (zest-close-remove
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (hbtc-vault <hbtc-vault-trait>)
  (collateral-token <ft>) (repay-token <ft>)
  (unstake-amount uint) (collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    (let (
      (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo))))

      (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)

      (try! (contract-call? .zest-interface zest-repay market repay-token repay-amount price-feed-1 price-feed-2))

      (try! (contract-call? .zest-interface zest-collateral-remove market collateral-token collateral-amount none none))

      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, hbtc-vault: hbtc-vault, collateral: { token: collateral-token, amount: collateral-amount }, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Open Position - Vault Path
;;-------------------------------------

(define-public (zest-deposit-add-open
  (market <zest-market>) (vault <zest-vault>) (staking <staking-trait>)
  (collateral-token <ft>) (borrow-token <ft>)
  (collateral-amount uint) (borrow-amount uint) (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    (try! (contract-call? .zest-interface zest-supply-collateral-add market vault collateral-token collateral-amount min-shares price-feed-1 price-feed-2))

    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)
    (try! (contract-call? .zest-interface zest-borrow market borrow-token borrow-amount none none))
    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))

    (print { action: "zest-deposit-add-open", user: contract-caller, data: { market: market, vault: vault, staking: staking, collateral: { token: collateral-token, amount: collateral-amount }, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position - Vault Path
;;-------------------------------------

(define-public (zest-close-remove-redeem
  (market <zest-market>) (vault <zest-vault>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (hbtc-vault <hbtc-vault-trait>)
  (repay-token <ft>)
  (unstake-amount uint) (collateral-amount uint) (min-collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)

    (let (
      (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo)))
    )
      (try! (contract-call? .zest-interface zest-repay market repay-token repay-amount price-feed-1 price-feed-2))

      (try! (contract-call? .zest-interface zest-collateral-remove-redeem market vault collateral-amount min-collateral-amount none none))

      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove-redeem", user: contract-caller, data: { market: market, vault: vault, staking: staking, staking-silo: staking-silo, hbtc-vault: hbtc-vault, collateral: { amount: collateral-amount, min-amount: min-collateral-amount }, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Sweep and Reward
;;-------------------------------------

(define-public (zest-sweep-and-reward
  (asset <ft>)
  (sweep-amount uint)
  (reward uint)
  (is-positive bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-rewarder contract-caller))
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> sweep-amount u0) ERR_INVALID_AMOUNT)

    (try! (contract-call? .zest-interface sweep asset sweep-amount))

    (try! (contract-call? .controller-hbtc log-reward reward is-positive))

    (print { action: "zest-sweep-and-reward", user: contract-caller, data: { asset: asset, sweep-amount: sweep-amount, reward: reward, is-positive: is-positive } })
    (ok true)
  )
)