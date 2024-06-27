;; @contract Minting OTC
;; @version 0.1

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NO_REQUEST_FOR_ID (err u2001))
(define-constant ERR_BELOW_MIN (err u2002))
(define-constant ERR_NOT_ALLOWED (err u2003))
(define-constant ERR_TRADING_DISABLED (err u2004))
(define-constant ERR_CONFIRMATION_OPEN (err u2005))
(define-constant ERR_STALE_DATA (err u2006))
(define-constant ERR_MINT_LIMIT_EXCEEDED (err u2007))
(define-constant ERR_AMOUNT_MISMATCH (err u2008))
(define-constant ERR_SLIPPAGE_TOO_HIGH (err u2009))
(define-constant ERR_ABOVE_MAX (err u2010))

(define-constant minting-contract (as-contract tx-sender))
(define-constant max-confirmation-window u144)
(define-constant max-commission u200)                            ;; bps
(define-constant bps-base (pow u10 u4))
(define-constant usdh-base (pow u10 u8))
(define-constant oracle-base (pow u10 u8))

(define-constant max-mint-limit (* u250000 usdh-base))
(define-constant min-mint-limit-reset-window u6)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var redeem-confirmation-window uint u10)           ;; burn-block-height
(define-data-var mint-enabled bool true)                        ;; disable mint
(define-data-var redeem-enabled bool true)                      ;; disable redeem

(define-data-var current-redeem-id uint u0)

(define-data-var mint-limit uint (* u100000 usdh-base))         ;; usdh
(define-data-var current-mint-limit uint (* u100000 usdh-base)) ;; usdh
(define-data-var mint-limit-reset-window uint u6)               ;; burn-block-height
(define-data-var last-mint-limit-reset uint burn-block-height)  ;; burn-block-height

(define-data-var min-redeem-amount uint (* u100 usdh-base))     ;; usdh      

(define-data-var mint-commission-usdh uint u10)                 ;; bps
(define-data-var redeem-commission-usdh uint u10)               ;; bps
(define-data-var mint-commission-asset uint u10)                ;; bps
(define-data-var redeem-commission-asset uint u10)              ;; bps

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map traders
  { 
    address: principal 
  }
  {
    minter: bool,
    redeemer: bool
  }
)

(define-map redeem-requests
  { 
    request-id: uint 
  }
  {
    requester: principal,
    btc-address: (string-ascii 64),
    amount-usdh: uint,            ;; USDh; usdh-base
    price: uint,                  ;; BTCUSD; oracle-base
    amount-asset-requested: uint, ;; BTC; token-base
    slippage: uint,               ;; bps
    block-height: uint,           ;; burn-block-height
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-redeem-confirmation-window) 
  (var-get redeem-confirmation-window)
)

(define-read-only (get-mint-enabled) 
  (var-get mint-enabled)
)

(define-read-only (get-redeem-enabled) 
  (var-get redeem-enabled)
)

(define-read-only (get-current-redeem-id) 
  (var-get current-redeem-id)
)

(define-read-only (get-mint-limit) 
  (var-get mint-limit)
)

(define-read-only (get-current-mint-limit) 
  (var-get current-mint-limit)
)

(define-read-only (get-mint-limit-reset-window) 
  (var-get mint-limit-reset-window)
)

(define-read-only (get-last-mint-limit-reset) 
  (var-get last-mint-limit-reset)
)

(define-read-only (get-min-redeem-amount) 
  (var-get min-redeem-amount)
)

(define-read-only (get-mint-commission-usdh) 
  (var-get mint-commission-usdh)
)

(define-read-only (get-redeem-commission-usdh) 
  (var-get redeem-commission-usdh)
)

(define-read-only (get-mint-commission-asset) 
  (var-get mint-commission-asset)
)

(define-read-only (get-redeem-commission-asset) 
  (var-get redeem-commission-asset)
)

(define-read-only (get-trader (address principal))
  (default-to 
    { minter: false, redeemer: false }
    (map-get? traders { address: address })
  )
)

(define-read-only (get-redeem-request (request-id uint))
  (ok (unwrap! (map-get? redeem-requests { request-id: request-id }) ERR_NO_REQUEST_FOR_ID))
) 


;;-------------------------------------
;; User
;;-------------------------------------

(define-public (request-redeem (btc-address (string-ascii 64)) (amount-usdh uint) (price uint) (slippage uint))
  (let (
    (next-redeem-id (+ (get-current-redeem-id) u1))
    (amount-asset-requested (/ (* amount-usdh oracle-base (pow u10 u8)) price usdh-base))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (var-get redeem-enabled) ERR_TRADING_DISABLED)
    (asserts! (>= amount-usdh (get-min-redeem-amount)) ERR_BELOW_MIN)

    (try! (contract-call? .usdh-token transfer amount-usdh tx-sender minting-contract none))

    (map-set redeem-requests { request-id: next-redeem-id } 
      {   
        requester: tx-sender,
        btc-address: btc-address,
        amount-usdh: amount-usdh,                       ;; USDh
        price: price,                                   ;; BTCUSD
        amount-asset-requested: amount-asset-requested, ;; BTC; token-base
        slippage: slippage,                             ;; bps
        block-height: burn-block-height,
      }
    )

    (print { request-id: next-redeem-id, requester: tx-sender, btc-address: btc-address, amount-usdh: amount-usdh, price: price, slippage: slippage, block-height: burn-block-height })
    (var-set current-redeem-id next-redeem-id)
    (ok true)
  )
)

(define-public (claim-unconfirmed-redeem (redeem-id uint))
  (let (
    (redeem-request (try! (get-redeem-request redeem-id)))
    (requester (get requester redeem-request))
  )
    (asserts! (is-eq requester tx-sender) ERR_NOT_ALLOWED)
    (asserts! (> burn-block-height (+ (get block-height redeem-request) (get-redeem-confirmation-window))) ERR_CONFIRMATION_OPEN)
    
    (try! (as-contract (contract-call? .usdh-token transfer (get amount-usdh redeem-request) tx-sender requester none)))
    (map-delete redeem-requests { request-id: redeem-id })
    (ok true)
  )
)

;;-------------------------------------
;; Trader
;;-------------------------------------

(define-public (confirm-mint (request-id (string-ascii 36)) (requester principal) (amount-asset uint) (price uint))
  (let (
    (amount-usdh (/ (* amount-asset price) oracle-base))
    (amount-usdh-commission (/ (* amount-usdh (var-get mint-commission-usdh)) bps-base))
    (amount-usdh-confirmed (- amount-usdh amount-usdh-commission))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (var-get mint-enabled) ERR_TRADING_DISABLED)
    (asserts! (get minter (get-trader tx-sender)) ERR_NOT_ALLOWED)

    (if (> burn-block-height (+ (get-last-mint-limit-reset) (get-mint-limit-reset-window))) 
      (begin
        (var-set current-mint-limit (get-mint-limit))
        (var-set last-mint-limit-reset burn-block-height) 
      )
      true
    )
    (asserts! (<= amount-usdh (get-current-mint-limit)) ERR_MINT_LIMIT_EXCEEDED)

    (try! (contract-call? .usdh-token mint-for-protocol amount-usdh-confirmed requester))
    (if (> amount-usdh-commission u0) (try! (contract-call? .usdh-token mint-for-protocol amount-usdh-commission .reserve)) true)

    (print { request-id: request-id, requester: requester, price: price, amount-usdh: amount-usdh, amount-usdh-confirmed: amount-usdh-confirmed, block-height: burn-block-height })
    (var-set current-mint-limit (- (get-current-mint-limit) amount-usdh))
    (ok true)
  )
)

(define-public (confirm-redeem (request-id uint) (price  uint) (amount-usdh uint))
  (let (
    (redeem-request (try! (get-redeem-request request-id)))
    (price-requested (get price redeem-request))
    (amount-usdh-requested (get amount-usdh redeem-request))
    (btc-address (get btc-address redeem-request))
    (requester (get requester redeem-request))
    (slippage-tolerance (/ (* price-requested (get slippage redeem-request)) bps-base))
    (amount-usdh-commission (/ (* amount-usdh (var-get redeem-commission-usdh)) bps-base))
    (amount-usdh-confirmed (- amount-usdh amount-usdh-commission))
    (amount-asset-confirmed (/ (* (/ (* amount-usdh-confirmed oracle-base) price) (- bps-base (var-get redeem-commission-asset))) bps-base))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (var-get redeem-enabled) ERR_TRADING_DISABLED)
    (asserts! (get redeemer (get-trader tx-sender)) ERR_NOT_ALLOWED)
    (asserts! (is-eq amount-usdh amount-usdh-requested) ERR_AMOUNT_MISMATCH)
    (asserts! (<= price (+ price-requested slippage-tolerance)) ERR_SLIPPAGE_TOO_HIGH)

    (print { request-id: request-id, price: price, amount-usdh: amount-usdh, amount-usdh-confirmed: amount-usdh-confirmed, amount-asset-confirmed: amount-asset-confirmed, btc-address: btc-address })
    (try! (as-contract (contract-call? .usdh-token burn-for-protocol amount-usdh-confirmed tx-sender)))
    (if (> amount-usdh-commission u0) (try! (as-contract (contract-call? .usdh-token transfer amount-usdh-commission tx-sender .reserve none))) true)

    (map-delete redeem-requests { request-id: request-id })
    (ok true)
  )
)

(define-public (cancel-redeem-request-many (entries (list 1000 uint)))
  (ok (map cancel-redeem-request entries)))

(define-public (cancel-redeem-request (request-id uint))
  (let (
    (redeem-request (try! (get-redeem-request request-id)))
    (amount-usdh-requested (get amount-usdh redeem-request))
    (requester (get requester redeem-request))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (var-get redeem-enabled) ERR_TRADING_DISABLED)
    (asserts! (get redeemer (get-trader tx-sender)) ERR_NOT_ALLOWED)

    (try! (as-contract (contract-call? .usdh-token transfer amount-usdh-requested tx-sender requester none)))
    (map-delete redeem-requests { request-id: request-id })
    (ok true)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-redeem-confirmation-window (new-window uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-window max-confirmation-window) ERR_ABOVE_MAX)
    (var-set redeem-confirmation-window new-window)
    (ok true)
  )
)

(define-public (set-mint-enabled (mint-enabled-set bool))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (var-set mint-enabled mint-enabled-set)
    (ok true)
  )
)

(define-public (set-redeem-enabled (redeem-enabled-set bool))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (var-set redeem-enabled redeem-enabled-set)
    (ok true)
  )
)

(define-public (set-mint-limit (new-limit uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-limit max-mint-limit) ERR_ABOVE_MAX)
    (ok (var-set mint-limit new-limit)))
)

(define-public (set-mint-limit-reset-window (new-window uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (>= new-window min-mint-limit-reset-window) ERR_BELOW_MIN)
    (ok (var-set mint-limit-reset-window new-window)))
)

(define-public (set-min-redeem-amount (new-redeem-amount uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (ok (var-set min-redeem-amount new-redeem-amount)))
)

(define-public (set-mint-commission-usdh (new-mint-commission-usdh uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-mint-commission-usdh max-commission) ERR_ABOVE_MAX)
    (ok (var-set mint-commission-usdh new-mint-commission-usdh)))
)

(define-public (set-redeem-commission-usdh (new-redeem-commission-usdh uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-redeem-commission-usdh max-commission) ERR_ABOVE_MAX)
    (ok (var-set redeem-commission-usdh new-redeem-commission-usdh)))
)

(define-public (set-mint-commission-asset (new-mint-commission-asset uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-mint-commission-asset max-commission) ERR_ABOVE_MAX)
    (ok (var-set mint-commission-asset new-mint-commission-asset)))
)

(define-public (set-redeem-commission-asset (new-redeem-commission-asset uint))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (asserts! (<= new-redeem-commission-asset max-commission) ERR_ABOVE_MAX)
    (ok (var-set redeem-commission-asset new-redeem-commission-asset)))
)

(define-public (set-trader (address principal) (mint bool) (redeem bool))
  (begin
    (try! (contract-call? .hq check-is-protocol tx-sender))
    (map-set traders { address: address } { minter: mint, redeemer: redeem})
    (ok true)
  )
)

;;-------------------------------------
;; Init 
;;-------------------------------------

(map-set traders { address: tx-sender } { minter: true, redeemer: true })