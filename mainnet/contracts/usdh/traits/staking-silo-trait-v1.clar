;; @contract Staking Silo Trait
;; @version 1

;;-------------------------------------
;; Trait Definition
;;-------------------------------------

(define-trait staking-silo-trait
  (

    ;; @desc - Get claim data by ID
    (get-claim (uint) (response {recipient: principal, amount: uint, ts: uint} uint))

    ;; @desc - Transfer USDh to recipient after cooldown window has passed
    (withdraw (uint) (response bool uint))

  )
)