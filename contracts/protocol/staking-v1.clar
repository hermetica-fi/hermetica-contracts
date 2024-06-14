;; @contract Staking
;; @version 0.1
;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u3001))

(define-constant token-base (pow u10 u8))

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var total-staked uint u0)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-usdh-per-susdh) 
  (let (
    (total-usdh-staked (var-get total-staked))
    (total-susdh-supply (unwrap-panic (contract-call? .susdh-token get-total-supply)))
  )
    (if (and (> total-usdh-staked u0) (> total-susdh-supply u0))   
      (/ 
        (* 
          total-usdh-staked
          token-base
        )
        total-susdh-supply
      )
      token-base
    )
  )
)

;;-------------------------------------
;; User  
;;-------------------------------------

(define-public (stake (amount uint))
  (let (
    (ratio (get-usdh-per-susdh))
    (amount-susdh (/ (* amount token-base) ratio))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (contract-call? .blacklist-susdh check-is-not-soft-blacklist tx-sender))
    (try! (contract-call? .hq check-is-enabled))

    (try! (contract-call? .usdh-token burn-for-protocol amount tx-sender))
    (var-set total-staked (+ (var-get total-staked) amount))
    (try! (contract-call? .susdh-token mint-for-protocol amount-susdh tx-sender))
    (ok true)
  )
)

(define-public (unstake (amount uint))
  (let (
    (ratio (get-usdh-per-susdh))
    (amount-usdh (/ (* amount ratio) token-base))
    (total-usdh-staked (var-get total-staked))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= amount total-usdh-staked) ERR_INVALID_AMOUNT)
    (try! (contract-call? .blacklist-susdh check-is-not-soft-blacklist tx-sender))
    
    (try! (contract-call? .susdh-token burn-for-protocol amount tx-sender))
    (try! (contract-call? .staking-silo create-claim amount-usdh tx-sender))
    (try! (contract-call? .usdh-token mint-for-protocol amount-usdh .staking-silo))
    (var-set total-staked (- total-usdh-staked amount))
    (print { amount-susdh: amount, amount-usdh: amount-usdh, ratio: ratio })
    (ok true)
  )
)