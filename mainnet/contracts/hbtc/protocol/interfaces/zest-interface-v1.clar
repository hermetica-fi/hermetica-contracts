;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Zest Interface
;; @version 1
;; @description Zest v2 interface for lending/borrowing

(use-trait ft 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.ft-trait.ft-trait)
(use-trait zest-market 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.market-trait.market-trait)
(use-trait zest-vault 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.vault-traits.tokenized-vault)

(define-constant ERR_INVALID_AMOUNT (err u111001))

(define-constant reserve .reserve)

;;-------------------------------------
;; Trader - Collateral Management
;;-------------------------------------

(define-public (zest-collateral-add
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) none (some (contract-of asset)) none amount price-feed-1 price-feed-2))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let ((total (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount))
      (try! (contract-call? market collateral-add asset amount none))
    ))))
      (print { action: "zest-collateral-add", user: contract-caller, data: { market: market, collateral: { token: asset, amount: amount, new-total: total } } })
      (ok total)
    )
  )
)

(define-public (zest-collateral-remove
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) none (some (contract-of asset)) none amount price-feed-1 price-feed-2))

    (let ((remaining (try! (as-contract? () (try! (contract-call? market collateral-remove asset amount (some reserve) none))))))

      (print { action: "zest-collateral-remove", user: contract-caller, data: { market: market, collateral: { token: asset, amount: amount, remaining: remaining } } })
      (ok remaining)
    )
  )
)

;;-------------------------------------
;; Trader - Borrowing
;;-------------------------------------

(define-public (zest-borrow
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) none (some (contract-of asset)) none amount price-feed-1 price-feed-2))

    (try! (as-contract? () (try! (contract-call? market borrow asset amount (some reserve) none))))

    (print { action: "zest-borrow", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount } } })
    (ok true)
  )
)

(define-public (zest-repay
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) none (some (contract-of asset)) none amount price-feed-1 price-feed-2))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let (
      (repaid-amount (try! (as-contract?
        ((with-ft (contract-of asset) "*" amount) (with-stx amount))
        (try! (contract-call? market repay asset amount (some current-contract)))
      )))
      (leftover (if (< repaid-amount amount) (- amount repaid-amount) u0))
    )
      (if (> leftover u0)
        (try! (as-contract? ((with-ft (contract-of asset) "*" leftover) (with-stx leftover)) (try! (contract-call? asset transfer leftover current-contract reserve none))))
        true
      )
      (print { action: "zest-repay", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount, actual-amount: repaid-amount } } })
      (ok repaid-amount)
    )
  )
)

;;-------------------------------------
;; Liquidity Provider - Vault Management
;;-------------------------------------

(define-public (zest-deposit
  (vault <zest-vault>)
  (asset <ft>)
  (amount uint)
  (min-shares uint))
  (begin
    (try! (execute-checks-write-feeds (contract-of vault) none (some (contract-of asset)) none amount none none))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let (
      (received (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount))
        (try! (contract-call? vault deposit amount min-shares reserve))
      )))
    )
      (print { action: "zest-deposit", user: contract-caller, data: { vault: vault, asset: { token: asset, amount: amount }, shares: { min-shares: min-shares, received: received } } })
      (ok received)
    )
  )
)

(define-public (zest-redeem
  (vault <zest-vault>)
  (shares uint)
  (min-amount uint))
  (begin
    (try! (execute-checks-write-feeds (contract-of vault) none none none shares none none))

    (try! (contract-call? .reserve transfer vault shares current-contract))

    (let (
      (received (try! (as-contract? ((with-ft (contract-of vault) "*" shares))
        (try! (contract-call? vault redeem shares min-amount reserve))
      )))
    )
      (print { action: "zest-redeem", user: contract-caller, data: { vault: vault, shares: shares, collateral: { min-amount: min-amount, received: received } } })
      (ok received)
    )
  )
)

(define-public (zest-supply-collateral-add
  (market <zest-market>) (vault <zest-vault>)
  (asset <ft>)
  (amount uint)
  (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) (some (contract-of vault)) (some (contract-of asset)) none amount price-feed-1 price-feed-2))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let (
      (received-z-tokens (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount)) (try! (contract-call? vault deposit amount min-shares current-contract)))))
      (total-collateral (try! (as-contract? ((with-ft (contract-of vault) "*" received-z-tokens)) (try! (contract-call? market collateral-add vault received-z-tokens none)))))
    )
      (print { action: "zest-supply-collateral-add", user: contract-caller, data: { market: market, collateral: { token: vault, amount: received-z-tokens, new-total: total-collateral }, underlying: { token: asset, amount: amount } } })
      (ok total-collateral)
    )
  )
)

(define-public (zest-collateral-remove-redeem
  (market <zest-market>) (vault <zest-vault>)
  (amount uint)
  (min-underlying uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (execute-checks-write-feeds (contract-of market) (some (contract-of vault)) (some (contract-of vault)) none amount price-feed-1 price-feed-2))

    (let (
      (remaining-collateral (try! (as-contract? () (try! (contract-call? market collateral-remove vault amount (some current-contract) none)))))
      (received-underlying (try! (as-contract? ((with-ft (contract-of vault) "*" amount)) (try! (contract-call? vault redeem amount min-underlying reserve)))))
    )
      (print { action: "zest-collateral-remove-redeem", user: contract-caller, data: { market: market, collateral: { token: vault, amount: amount, remaining: remaining-collateral }, underlying: { received: received-underlying, min-amount: min-underlying } } })
      (ok received-underlying)
    )
  )
)

;;-------------------------------------
;; Sweep
;;-------------------------------------

(define-public (sweep (asset <ft>) (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-is-asset (contract-of asset)))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (as-contract?
      ((with-ft (contract-of asset) "*" amount) (with-stx amount))
      (try! (contract-call? asset transfer amount current-contract reserve none))
    ))
    (print { action: "sweep", user: contract-caller, data: { sender: current-contract, recipient: reserve, asset: { token: asset, amount: amount } } })
    (ok amount)
  )
)

;;-------------------------------------
;; Helper
;;-------------------------------------

(define-private (execute-checks-write-feeds
  (external-1 principal) (external-2 (optional principal))
  (asset-1 (optional principal)) (asset-2 (optional principal))
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth external-1 external-2 asset-1 asset-2))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (write-feed price-feed-1))
    (write-feed price-feed-2)
  )
)

(define-private (write-feed (price-feed (optional (buff 8192))))
  (match price-feed bytes
    (begin
      (try! (contract-call? 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-oracle-v4 verify-and-update-price-feeds
        bytes
        {
          pyth-storage-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-storage-v4,
          pyth-decoder-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-pnau-decoder-v3,
          wormhole-core-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-core-v4,
        }
      ))
      (print { action: "write-feed", user: contract-caller, data: { requested-by: current-contract, oracle: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-oracle-v4 } })
      (ok true)
    )
    (ok true)
  )
)