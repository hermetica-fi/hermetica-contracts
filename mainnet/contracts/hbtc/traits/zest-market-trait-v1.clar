;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Zest Market Trait v1
;; @version 1.0
;; @desc Trait definition for Zest v2 market contract

(use-trait ft 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.ft-trait.ft-trait)

(define-trait zest-market-trait
  (
    (collateral-add (<ft> uint (optional (list 3 (buff 8192)))) (response uint uint))
    (collateral-remove (<ft> uint (optional principal) (optional (list 3 (buff 8192)))) (response uint uint))
    (borrow (<ft> uint (optional principal) (optional (list 3 (buff 8192)))) (response bool uint))
    (repay (<ft> uint (optional principal)) (response uint uint))
  )
)
