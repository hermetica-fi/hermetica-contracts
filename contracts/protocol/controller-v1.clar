;; @contract Controller
;; @version 0.1

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_UPDATER (err u5001))
(define-constant ERR_UPDATE_WINDOW_CLOSED (err u5002))
(define-constant ERR_ABOVE_MAX (err u5003))
(define-constant ERR_INVALID_DISTRIBUTION (err u5004))
(define-constant ERR_BELOW_MIN (err u5005))

(define-constant max-pnl u20)                     ;; bps
(define-constant min-update-window (* u6 u6))     ;; burn-block-height

(define-constant bps-base (pow u10 u4))

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var distribution 
  {
    staking: uint,                    ;; bps
    insurance-fund: uint,             ;; bps            
    reserve: uint                     ;; bps
  } 

  {
    staking: u7000,
    insurance-fund: u2000,
    reserve: u1000
  }
)

(define-data-var max-pnl-per-window uint u10)                     ;; bps
(define-data-var pnl-remainder-helper uint u0)        
(define-data-var update-window uint (* u6 u8))                    ;; burn-block-height

(define-data-var last-log-block-height uint burn-block-height)    ;; burn-block-height

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map updaters
  { 
    address: principal 
  }
  {
    active: bool,
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-distribution) 
  (var-get distribution)
)

(define-read-only (get-max-pnl-per-window) 
  (var-get max-pnl-per-window)
)

(define-read-only (get-update-window) 
  (var-get update-window)
)

(define-read-only (get-last-log-block-height) 
  (var-get last-log-block-height)
)

(define-read-only (get-updater (address principal))
  (get active 
    (default-to 
      { active: false }
      (map-get? updaters { address: address })
    )
  )
)

;;-------------------------------------
;; Checks  
;;-------------------------------------

(define-public (check-is-updater (contract principal))
  (begin
    (asserts! (get-updater contract) ERR_NOT_UPDATER)
    (ok true)
  )
)

;;-------------------------------------
;; Updater
;;-------------------------------------

(define-public (log-pnl (pnl uint) (is-positive bool))
  (begin
    (try! (contract-call? .hq check-is-enabled))
    (try! (check-is-updater tx-sender))
    (asserts! (> burn-block-height (+ (var-get last-log-block-height) (var-get update-window))) ERR_UPDATE_WINDOW_CLOSED)
    (asserts! (<= pnl (/ (* (var-get max-pnl-per-window) (unwrap-panic (contract-call? .usdh-token get-total-supply))) bps-base))  ERR_ABOVE_MAX)
    (if (> pnl u0)
      (if is-positive
        ( ;; positive pnl
          let ( 
            (staking-share (get staking (get-distribution)))
            (insurance-share (get insurance-fund (get-distribution)))
            (reserve-share (get reserve (get-distribution)))
          )
            (print { staking-share: staking-share, insurance-share: insurance-share, reserve-share: reserve-share })
            (try! (contract-call? .staking log-staking-pnl (/ (* staking-share pnl) bps-base) ))
            (try! (contract-call? .usdh-token mint-for-protocol (/ (* insurance-share pnl) bps-base) .insurance-fund))
            (try! (contract-call? .usdh-token mint-for-protocol (/ (* reserve-share pnl) bps-base) .reserve))
        )
        ( ;; negative pnl
          let ( 
            (insurance-balance (unwrap-panic (contract-call? .usdh-token get-balance .insurance-fund)))
            (reserve-balance (unwrap-panic (contract-call? .usdh-token get-balance .reserve)))
          )
            (if (<= pnl insurance-balance) 
              (try! (contract-call? .usdh-token burn-for-protocol pnl .insurance-fund))
              (begin 
                (var-set pnl-remainder-helper (- pnl insurance-balance))
                (if (> insurance-balance u0) 
                  (try! (contract-call? .usdh-token burn-for-protocol insurance-balance .insurance-fund))
                  true
                )
                (if (<= (var-get pnl-remainder-helper) reserve-balance)
                  (try! (contract-call? .usdh-token burn-for-protocol (var-get pnl-remainder-helper) .reserve))
                  (begin
                    (if (> reserve-balance u0) 
                      (try! (contract-call? .usdh-token burn-for-protocol reserve-balance .reserve))
                      true
                    )
                    (var-set pnl-remainder-helper (- (var-get pnl-remainder-helper) reserve-balance))
                    (print { unprocessed-negative-pnl: (var-get pnl-remainder-helper)})
                    true
                  )
                )
              )
            )
        )
      )
      true
    )
    (var-set last-log-block-height burn-block-height)
    (ok true)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-distribution (new-distribution {
    staking: uint,             ;; bps
    insurance-fund: uint,      ;; bps            
    reserve: uint              ;; bps
  }))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (is-eq u10000 
      (+ 
        (get staking new-distribution) 
        (get insurance-fund new-distribution) 
        (get reserve new-distribution)
      )) ERR_INVALID_DISTRIBUTION)
    (var-set distribution new-distribution)
    (ok true)
  )
)

(define-public (set-max-pnl-per-window (new-max-pnl-per-window uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-max-pnl-per-window max-pnl) ERR_ABOVE_MAX)
    (var-set max-pnl-per-window new-max-pnl-per-window)
    (ok true)
  )
)

(define-public (set-update-window (new-update-window uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (>= new-update-window min-update-window) ERR_BELOW_MIN)
    (var-set update-window new-update-window)
    (ok true)
  )
)

(define-public (set-updater (address principal) (active bool))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (map-set updaters { address: address } { active: active })
    (ok true)
  )
)

;;-------------------------------------
;; Init 
;;-------------------------------------

(map-set updaters { address: tx-sender } { active: true })