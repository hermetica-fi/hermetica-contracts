;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Staking Trait
;; @version 1

;;-------------------------------------
;; Trait Definition
;;-------------------------------------

(define-trait staking-trait
  (

    ;; @desc - Get the current USDh per sUSDh ratio
    (get-usdh-per-susdh () (response uint uint))

    ;; @desc - Stake USDh to mint sUSDh
    (stake (uint (optional (buff 64))) (response bool uint))

    ;; @desc - Create a claim to unstake sUSDh (with cooldown period)
    (unstake (uint) (response uint uint))

  )
)