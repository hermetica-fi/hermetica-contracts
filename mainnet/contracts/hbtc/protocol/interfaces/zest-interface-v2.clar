;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Zest Interface
;; @version 2
;; @description Zest v2 interface for lending/borrowing

(use-trait ft 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.ft-trait.ft-trait)
(use-trait zest-market 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.market-trait-v7.market-trait-v7)

(define-constant ERR_INVALID_AMOUNT (err u111001))

(define-constant reserve .reserve)

(define-constant max-oracle-fee u1000000)

;;-------------------------------------
;; Trader - Collateral Management
;;-------------------------------------

(define-public (zest-collateral-add
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (execute-checks (contract-of market) (contract-of asset) amount))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let ((total (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx max-oracle-fee))
      (try! (contract-call? market collateral-add asset amount price-feeds))
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
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (execute-checks (contract-of market) (contract-of asset) amount))

    (let ((remaining (try! (as-contract? ((with-stx max-oracle-fee)) (try! (contract-call? market collateral-remove asset amount (some reserve) price-feeds))))))
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
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (execute-checks (contract-of market) (contract-of asset) amount))

    (try! (as-contract? ((with-stx max-oracle-fee)) (try! (contract-call? market borrow asset amount (some reserve) price-feeds))))

    (print { action: "zest-borrow", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount } } })
    (ok true)
  )
)

(define-public (zest-repay
  (market <zest-market>)
  (asset <ft>)
  (amount uint))
  (begin
    (try! (execute-checks (contract-of market) (contract-of asset) amount))

    (try! (contract-call? .reserve transfer asset amount current-contract))

    (let (
      (repaid-amount (try! (as-contract?
        ((with-ft (contract-of asset) "*" amount))
        (try! (contract-call? market repay asset amount (some current-contract)))
      )))
      (leftover (if (< repaid-amount amount) (- amount repaid-amount) u0))
    )
      (if (> leftover u0)
        (try! (as-contract? ((with-ft (contract-of asset) "*" leftover)) (try! (contract-call? asset transfer leftover current-contract reserve none))))
        true
      )
      (print { action: "zest-repay", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount, actual-amount: repaid-amount } } })
      (ok repaid-amount)
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
      ((with-ft (contract-of asset) "*" amount))
      (try! (contract-call? asset transfer amount current-contract reserve none))
    ))
    (print { action: "sweep", user: contract-caller, data: { sender: current-contract, recipient: reserve, asset: { token: asset, amount: amount } } })
    (ok amount)
  )
)

;;-------------------------------------
;; Helper
;;-------------------------------------

(define-private (execute-checks (market principal) (asset principal) (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth market none (some asset) none))
    (ok (asserts! (> amount u0) ERR_INVALID_AMOUNT))
  )
)
