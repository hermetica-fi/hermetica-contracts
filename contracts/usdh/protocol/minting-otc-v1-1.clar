;; @contract Minting OTC
;; @version 1.1

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_NO_REQUEST_FOR_ID (err u2101))
(define-constant ERR_BELOW_MIN (err u2102))
(define-constant ERR_NOT_ALLOWED (err u2103))
(define-constant ERR_TRADING_DISABLED (err u2104))
(define-constant ERR_CONFIRMATION_OPEN (err u2105))
(define-constant ERR_MINT_LIMIT_EXCEEDED (err u2106))
(define-constant ERR_AMOUNT_NOT_ALLOWED (err u2107))
(define-constant ERR_SLIPPAGE_TOO_HIGH (err u2108))
(define-constant ERR_ABOVE_MAX (err u2109))
(define-constant ERR_ALREADY_CONFIRMED (err u2110))
(define-constant ERR_NOT_WHITELISTED (err u2111))
(define-constant ERR_REQUEST_ID_ALREADY_EXISTS (err u2112))

(define-constant bps-base (pow u10 u4))
(define-constant usdh-base (pow u10 u8))
(define-constant oracle-base (pow u10 u8))

(define-constant max-mint-limit (* u1000000 usdh-base))
(define-constant min-mint-limit-reset-window u1200)               ;; 20 minutes in seconds

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var mint-limit uint (* u1000000 usdh-base))
(define-data-var current-mint-limit uint (* u1000000 usdh-base))
(define-data-var mint-limit-reset-window uint u3600)              ;; 1 hour in seconds
(define-data-var last-mint-limit-reset uint stacks-block-time)    ;; unix timestamp

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

(define-map mint-requests 
  {
    request-id: (string-ascii 36)
  }
  {
    confirmed: bool 
  }
)

(define-map redeem-requests
  {
    request-id: (string-ascii 36) 
  }
  {
    requester: principal,
    btc-address: (string-ascii 64),
    amount-usdh: uint,            ;; USDh; usdh-base
    price: uint,                  ;; BTCUSD; oracle-base
    slippage: uint,               ;; bps
    ts: uint,                     ;; unix timestamp
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

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

(define-read-only (get-trader (address principal))
  (default-to
    { minter: false, redeemer: false }
    (map-get? traders { address: address })
  )
)

(define-read-only (get-mint-request-confirmed (request-id (string-ascii 36)))
  (default-to
    false
    (get confirmed (map-get? mint-requests { request-id: request-id }))
  )
)

(define-read-only (get-redeem-request (request-id (string-ascii 36)))
  (ok (unwrap! (map-get? redeem-requests { request-id: request-id }) ERR_NO_REQUEST_FOR_ID))
) 

;;-------------------------------------
;; User
;;-------------------------------------

(define-public (request-redeem (request-id (string-ascii 36)) (btc-address (string-ascii 64)) (amount-usdh uint) (price uint) (slippage uint))
  (let (
    (state (contract-call? .minting-state get-request-redeem-state contract-caller))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (get redeem-enabled state) ERR_TRADING_DISABLED)
    (asserts! (get whitelisted state) ERR_NOT_WHITELISTED)
    (asserts! (>= amount-usdh (get min-amount-usdh state)) ERR_BELOW_MIN)
    (asserts! (<= slippage bps-base) ERR_ABOVE_MAX)

    (try! (contract-call? .usdh-token transfer amount-usdh contract-caller current-contract none))

    (asserts! (map-insert redeem-requests { request-id: request-id }
      {
        requester: contract-caller,
        btc-address: btc-address,
        amount-usdh: amount-usdh,
        price: price,
        slippage: slippage,
        ts: stacks-block-time,
      }
    ) ERR_REQUEST_ID_ALREADY_EXISTS)

    (print { action: "request-redeem", user: contract-caller, data: { request-id: request-id, btc-address: btc-address, amount-usdh: amount-usdh, price: price, slippage: slippage, ts: stacks-block-time } })
    (ok true)
  )
)

(define-public (claim-unconfirmed-redeem (request-id (string-ascii 36)))
  (let (
    (redeem-request (try! (get-redeem-request request-id)))
    (requester (get requester redeem-request))
    (confirmation-window-blocks (contract-call? .minting-state get-redeem-confirmation-window)) ;; [burn blocks] 1 burn block =~ 10 min = 600 seconds
    (confirmation-window-seconds (* confirmation-window-blocks u600))
  )
    (asserts! (is-eq requester contract-caller) ERR_NOT_ALLOWED)
    (asserts! (> stacks-block-time (+ (get ts redeem-request) confirmation-window-seconds)) ERR_CONFIRMATION_OPEN)
    
    (try! (contract-call? .usdh-token transfer (get amount-usdh redeem-request) current-contract requester none))
    (print { action: "claim-unconfirmed-redeem", user: contract-caller, data: { request-id: request-id, amount-usdh: (get amount-usdh redeem-request) } })
    (ok (map-delete redeem-requests { request-id: request-id }))
  )
)

;;-------------------------------------
;; Trader
;;-------------------------------------

(define-public (confirm-mint (request-id (string-ascii 36)) (requester principal) (amount-usdh uint) (price uint))
  (let (
    (state (contract-call? .minting-state get-confirm-mint-state))
    (amount-usdh-fee (/ (* amount-usdh (get mint-fee-usdh state)) bps-base))
    (amount-usdh-after-fee (- amount-usdh amount-usdh-fee))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (contract-call? .minting-state check-is-minter requester) ERR_NOT_WHITELISTED)
    (asserts! (get mint-enabled state) ERR_TRADING_DISABLED)
    (asserts! (get minter (get-trader contract-caller)) ERR_NOT_ALLOWED)
    (asserts! (not (get-mint-request-confirmed request-id)) ERR_ALREADY_CONFIRMED)

    (if (>= stacks-block-time (+ (get-last-mint-limit-reset) (get-mint-limit-reset-window)))
      (begin
        (var-set current-mint-limit (get-mint-limit))
        (var-set last-mint-limit-reset stacks-block-time)
      )
      true
    )
    (asserts! (<= amount-usdh (get-current-mint-limit)) ERR_MINT_LIMIT_EXCEEDED)

    (try! (contract-call? .usdh-token mint-for-protocol amount-usdh-after-fee requester))
    (if (> amount-usdh-fee u0) (try! (contract-call? .usdh-token mint-for-protocol amount-usdh-fee (get fee-address state))) true)

    (print { action: "confirm-mint", user: contract-caller, data: { request-id: request-id, requester: requester, price: price, amount-usdh: amount-usdh, amount-usdh-after-fee: amount-usdh-after-fee, ts: stacks-block-time } })
    (var-set current-mint-limit (- (get-current-mint-limit) amount-usdh))
    (ok (map-insert mint-requests { request-id: request-id } { confirmed: true }))
  )
)

(define-public (confirm-redeem (request-id (string-ascii 36)) (price  uint) (amount-usdh uint))
  (let (
    (state (contract-call? .minting-state get-confirm-redeem-state))
    (redeem-request (try! (get-redeem-request request-id)))
    (price-requested (get price redeem-request))
    (amount-usdh-requested (get amount-usdh redeem-request))
    (slippage-tolerance (/ (* price-requested (get slippage redeem-request)) bps-base))
    (amount-usdh-fee (/ (* amount-usdh (get redeem-fee-usdh state)) bps-base))
    (amount-usdh-after-fee (- amount-usdh amount-usdh-fee))
    (amount-asset-after-fee (/ (* (/ (* amount-usdh-after-fee oracle-base) price) (- bps-base (get redeem-fee-asset state))) bps-base))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (get redeem-enabled state) ERR_TRADING_DISABLED)
    (asserts! (get redeemer (get-trader contract-caller)) ERR_NOT_ALLOWED)
    (asserts! (<= amount-usdh amount-usdh-requested) ERR_AMOUNT_NOT_ALLOWED)
    (asserts! (<= price (+ price-requested slippage-tolerance)) ERR_SLIPPAGE_TOO_HIGH)

    (print { action: "confirm-redeem", user: contract-caller, data: { request-id: request-id, price: price, amount-usdh: amount-usdh, amount-usdh-after-fee: amount-usdh-after-fee, amount-asset-after-fee: amount-asset-after-fee, btc-address: (get btc-address redeem-request) } })
    (try! (contract-call? .usdh-token burn-for-protocol amount-usdh-after-fee current-contract))
    (if (> amount-usdh-fee u0) (try! (contract-call? .usdh-token transfer amount-usdh-fee current-contract (get fee-address state) none)) true)
    (if (not (is-eq amount-usdh-requested amount-usdh))
      (try! (contract-call? .usdh-token transfer (- amount-usdh-requested amount-usdh) current-contract (get requester redeem-request) none))
      true
    )

    (ok (map-delete redeem-requests { request-id: request-id }))
  )
)

(define-public (cancel-redeem-request-many (entries (list 1000 (string-ascii 36))))
  (ok (map cancel-redeem-request entries)))

(define-public (cancel-redeem-request (request-id (string-ascii 36)))
  (let (
    (redeem-request (try! (get-redeem-request request-id)))
  )
    (try! (contract-call? .hq check-is-enabled))
    (asserts! (contract-call? .minting-state  get-redeem-enabled) ERR_TRADING_DISABLED)
    (asserts! (get redeemer (get-trader contract-caller)) ERR_NOT_ALLOWED)

    (try! (contract-call? .usdh-token transfer (get amount-usdh redeem-request) current-contract (get requester redeem-request) none))
    (print { action: "cancel-redeem-request", user: contract-caller, data: { request-id: request-id, amount-usdh: (get amount-usdh redeem-request), requester: (get requester redeem-request) } })
    (ok (map-delete redeem-requests { request-id: request-id }))
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-mint-limit (new-limit uint))
  (begin
    (try! (contract-call? .hq check-is-protocol contract-caller))
    (asserts! (<= new-limit max-mint-limit) ERR_ABOVE_MAX)
    (print { action: "set-mint-limit", user: contract-caller, data: { old: (get-mint-limit), new: new-limit } })
    (ok (var-set mint-limit new-limit)))
)

(define-public (set-mint-limit-reset-window (new-window uint))
  (begin
    (try! (contract-call? .hq check-is-protocol contract-caller))
    (asserts! (>= new-window min-mint-limit-reset-window) ERR_BELOW_MIN)
    (print { action: "set-mint-limit-reset-window", user: contract-caller, data: { old: (get-mint-limit-reset-window), new: new-window } })
    (ok (var-set mint-limit-reset-window new-window)))
)

(define-public (set-trader (address principal) (mint bool) (redeem bool))
  (begin
    (try! (contract-call? .hq check-is-protocol contract-caller))
    (print { action: "set-trader", user: contract-caller, data: { address: address, old: (get-trader address), new: { minter: mint, redeemer: redeem } } })
    (ok (map-set traders { address: address } { minter: mint, redeemer: redeem}))
  )
)