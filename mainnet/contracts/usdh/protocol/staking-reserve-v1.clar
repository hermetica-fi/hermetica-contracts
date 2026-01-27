;; @contract Staking Reserve
;; @version 1

;;-------------------------------------
;; Transfer USDh
;;-------------------------------------

(define-public (transfer (amount uint) (recipient principal))
  (begin 
    (try! (contract-call? .hq check-is-minting-contract contract-caller))
    (try! (contract-call? .hq check-is-protocol recipient))
    (ok (try! (as-contract (contract-call? .usdh-token transfer amount tx-sender recipient none))))
  )
)