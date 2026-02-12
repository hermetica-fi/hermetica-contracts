;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Fee Collector
;; @version 1
;; @description Collects protocol fees and transfers to fee address

(use-trait ft .sip-010-trait.sip-010-trait)

(define-constant ERR_INSUFFICIENT_BALANCE (err u107001))

;;-------------------------------------
;; Withdrawal
;;-------------------------------------

(define-public (withdraw (asset <ft>))
  (let (
    (asset-contract (contract-of asset))
    (balance (try! (contract-call? asset get-balance current-contract)))
    (fee-address (contract-call? .state get-fee-address))
  )
    (try! (contract-call? .state check-is-transfer-enabled))
    (try! (contract-call? .state check-is-asset asset-contract))
    (asserts! (> balance u0) ERR_INSUFFICIENT_BALANCE)
    (print { action: "withdraw", user: contract-caller, data: { asset: asset, amount: balance, recipient: fee-address, sender: current-contract, balance: balance }})
    (as-contract? ((with-ft asset-contract "*" balance) (with-stx balance))
      (try! (contract-call? asset transfer balance current-contract fee-address none))
    )
  )
)