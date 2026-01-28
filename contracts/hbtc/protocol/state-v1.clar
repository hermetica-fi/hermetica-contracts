;; @contract State
;; @version 1
;; @description Holds protocol configuration and state

(use-trait ft .sip-010-trait.sip-010-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_NOT_ASSET (err u102001))
(define-constant ERR_NOT_EXTERNAL (err u102002))
(define-constant ERR_TRANSFER_DISABLED (err u102003))
(define-constant ERR_VAULT_DISABLED (err u102004))
(define-constant ERR_DEPOSIT_DISABLED (err u102005))
(define-constant ERR_REDEEM_DISABLED (err u102006))
(define-constant ERR_TRADING_DISABLED (err u102007))
(define-constant ERR_ABOVE_MAX (err u102008))
(define-constant ERR_BELOW_MIN (err u102009))
(define-constant ERR_WINDOW_CLOSED (err u102010))
(define-constant ERR_NO_ENTRY (err u102011))
(define-constant ERR_DUPLICATE (err u102012))
(define-constant ERR_DEVIATION (err u102013))
(define-constant ERR_INVALID (err u102014))
(define-constant ERR_NO_OPERATIONS (err u102015))
(define-constant ERR_ZERO_SUPPLY (err u102016))
(define-constant ERR_EXPRESS_DISABLED (err u102017))
(define-constant ERR_FEE_WINDOW (err u102018))
(define-constant ERR_INVALID_TYPE (err u102019))
(define-constant ERR_LIMIT_EXCEEDED (err u102020))
(define-constant ERR_REWARD_DISABLED (err u102021))
(define-constant ERR_INVALID_DECIMALS (err u102022))

(define-constant max {
  mgmt-fee: u55,                                                  ;; [55 bps/10000] => 0.0055% daily (~2% annualized) - max management fee
  perf-fee: u2000,                                                ;; [2000 bps] => 20.00% - max performance fee on profits
  exit-fee: u100,                                                 ;; [100 bps] => 1.00% - max exit fee on redeems
  reserve-rate: u5000,                                            ;; [5000 bps] => 50.00% - max reserve fund allocation rate
  express-fee: u200,                                              ;; [200 bps] => 2.00% - max express redeem fee
  cooldown: u2592000,                                             ;; [2592000 seconds] => 30 days - redeem cooldown period
})

(define-constant bps-base u10000)                                 ;; 10^4 = 10000 (basis points base)
(define-constant share-base u100000000)                           ;; 10^8 = 100000000 (share price base) 
(define-constant one-hour u3600)                                  ;; [3600 seconds] => 1 hour - mgmt/perf fee change window after rewards

;; Timelocked update type IDs for uint vars (0x01-0x9F)
(define-constant MAX_REWARD 0x01)
(define-constant MAX_DEVIATION 0x02)
(define-constant MAX_SLIPPAGE 0x03)
(define-constant MIN_REDEEM 0x04)
(define-constant COOLDOWN 0x05)
(define-constant EXPRESS_COOLDOWN 0x06)
(define-constant EXPRESS_LIMIT 0x07)
(define-constant EXPRESS_WINDOW 0x08)
(define-constant UPDATE_WINDOW 0x09)

;; Timelocked update type IDs for maps (0xA0-0xFF)
(define-constant ASSET 0xA0)
(define-constant EXTERNAL 0xA1)

;;-------------------------------------
;; Variables
;;-------------------------------------

;; Fee Settings
(define-data-var fee-address principal tx-sender)
(define-data-var fees
  { mgmt-fee: uint, perf-fee: uint, exit-fee: uint, express-fee: uint }
  { mgmt-fee: u0, perf-fee: u1000, exit-fee: u0, express-fee: u50 })

;; Operational Limits
(define-data-var max-reward uint u3)                              ;; [3 bps] => 0.03% - max asset reward/loss per log-reward call
(define-data-var max-deviation uint u5)                           ;; [5 bps] => 0.05% - max share price deviation per update
(define-data-var max-slippage uint u500)                          ;; [500 bps] => 5.00% - max slippage for asset trades
(define-data-var reserve-rate uint u500)                          ;; [500 bps] => 5.00% - reserve fund allocation rate from profits (log-reward)
(define-data-var deposit-cap uint u0)                             ;; [8 decimals] - maximum total vault capacity
(define-data-var min-deposit uint u100)                           ;; [8 decimals] - minimum deposit amount
(define-data-var min-redeem uint u100)                            ;; [8 decimals] - minimum redeem amount
(define-data-var cooldown uint u259200)                           ;; [259200 seconds] => 3 days - default redeem cooldown period
(define-data-var express-cooldown uint u14400)                    ;; [14400 seconds] => 4 hours - express redeem cooldown period
(define-data-var express-limit uint u250)                         ;; [250 bps] => 2.50% - express limit as bps of total share supply per window
(define-data-var express-window uint u86400)                      ;; [86400 seconds] => 1 day - reset window for express limit
(define-data-var update-window uint u86340)                       ;; [86340 seconds] => 23 hours and 59 minutes - min time between reward updates
(define-data-var staleness-window uint u50)                       ;; [50 seconds] => ~50 seconds - price staleness check

;; Operational States
(define-data-var vault-enabled bool true)                          ;; vault enabled/disabled flag
(define-data-var transfer-enabled bool true)                       ;; vault asset transfers enabled/disabled flag (reserve, fee-collector)
(define-data-var deposit-enabled bool true)                        ;; deposits enabled/disabled flag
(define-data-var redeem-enabled bool true)                         ;; redeems enabled/disabled flag
(define-data-var trading-enabled bool true)                        ;; trading enabled/disabled flag
(define-data-var express-enabled bool false)                       ;; express redeems enabled/disabled flag
(define-data-var express-limit-enabled bool true)                  ;; express limit enforcement enabled/disabled flag
(define-data-var reward-enabled bool true)                         ;; rewards enabled/disabled flag

;; Accounting Variables
(define-data-var total-assets uint u0)                            ;; [8 decimals] - total assets in the reserve
(define-data-var pending-fees uint u0)                            ;; [8 decimals] - total pending fees payable to protocol
(define-data-var pending-rf uint u0)                              ;; [8 decimals] - total pending reserve fund payable to protocol
(define-data-var claim-id uint u0)                                ;; [counter] - current claim ID
(define-data-var last-log-ts uint u0)                             ;; [unix timestamp] - last reward log timestamp

;; Express Limit Tracking Variables
(define-data-var current-express-limit uint u0)                   ;; [8 decimals] - current available shares (hBTC) amount for express withdrawals
(define-data-var last-express-ts uint u0)                         ;; [unix timestamp] - timestamp of last express limit reset

;;-------------------------------------
;; Maps
;;-------------------------------------

;; SIP-010 tokens the protocol can interact with
(define-map assets
  {
    address: principal                                            ;; token contract address
  }
  {
    active: bool,                                                 ;; asset enabled/disabled for trading
    price-feed-id: (buff 32),                                     ;; [32 bytes] - Pyth price feed identifier
    token-base: uint,                                             ;; [10^decimals] - token decimal base (e.g., 10^6, 10^8)
    max-slippage: uint,                                           ;; [bps] - max swap slippage allowed for this asset
    is-stablecoin: bool,                                          ;; whether asset is USD stablecoin (affects pricing logic)
  }
)

;; External contracts the protocol can interact with 
(define-map externals 
  {
    address: principal                                            ;; external contract address
  }
  {
    active: bool,                                                 ;; connection enabled/disabled
  }
)

(define-map custom-cooldown
  { 
    address: principal                                            ;; user address
  }
  {
    cooldown: uint                                                ;; [seconds] - custom cooldown period for this user
  }
)

(define-map custom-exit-fee
  {
    address: principal                                            ;; user address
  }
  {
    exit-fee: uint                                                ;; [bps] - custom exit fee for this user
  }
)

(define-map update-requests 
  {
    type: (buff 1),                                               ;; [buff 1] - [0x01-0x7F] for vars, [0x80-0xFF] for maps
    address: (optional principal)                                 ;; [optional principal] - [none] for vars, [principal] for maps
  }
  {
    ts: uint,                                                     ;; [uint] - activation timestamp
    value: (optional uint),                                       ;; [optional uint] - [uint] for vars, [none] for maps
    is-add: bool,                                                 ;; [bool] - true for add operations, false for remove (only used for ASSET/EXTERNAL types)
    asset-config: (optional {                                     ;; [optional tuple] - [some(config)] for ASSET add operations, [none] otherwise
      price-feed-id: (buff 32),
      token-base: uint,
      max-slippage: uint,
      is-stablecoin: bool
    })                                                         
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-share-price)
  (let (
    (net-assets (get-net-assets))
    (total-supply (unwrap-panic (contract-call? .hbtc-token get-total-supply)))
  )
    (if (> total-supply u0)
      (/ (* net-assets share-base) total-supply)
      share-base  ;; 1:1 for first deposit
    )
  )
)

;; @desc - calculate how many shares (hBTC tokens) you'd get for a given asset amount
(define-read-only (convert-to-shares (assets-in uint))
  (let (
    (net-assets (get-net-assets))
    (total-supply (unwrap-panic (contract-call? .hbtc-token get-total-supply)))
  )
    (if (> total-supply u0)
      (/ (* assets-in total-supply) net-assets)
      assets-in ;; 1:1 for first deposit
    )
  )
)

;; @desc - calculate how many assets (sBTC) a given number of shares is worth
(define-read-only (convert-to-assets (shares uint))
  (/ (* shares (get-share-price)) share-base)
)

(define-read-only (get-net-assets)
  (- (get-total-assets) (get-pending-fees) (get-pending-rf))
)

(define-read-only (get-fee-address)
  (var-get fee-address)
)

(define-read-only (get-fees)
  (var-get fees)
)

(define-read-only (get-total-assets)  
  (var-get total-assets)
)

(define-read-only (get-cooldown)
  (var-get cooldown)
)

(define-read-only (get-express-cooldown)
  (var-get express-cooldown)
)

(define-read-only (get-deposit-cap)
  (var-get deposit-cap)
)

(define-read-only (get-min-deposit)
  (var-get min-deposit)
)

(define-read-only (get-min-redeem)
  (var-get min-redeem)
)

(define-read-only (get-max-reward)
  (var-get max-reward)
)

(define-read-only (get-max-deviation)
  (var-get max-deviation)
)

(define-read-only (get-max-slippage)
  (var-get max-slippage)
)

(define-read-only (get-update-window)
  (var-get update-window)
)

(define-read-only (get-reserve-rate)
  (var-get reserve-rate)
)

(define-read-only (get-last-log-ts)
  (var-get last-log-ts)
)

(define-read-only (get-staleness-window)
  (var-get staleness-window)
)

(define-read-only (get-pending-fees)
  (var-get pending-fees)
)

(define-read-only (get-pending-rf)
  (var-get pending-rf)
)

(define-read-only (get-pending)
  { fees: (get-pending-fees), rf: (get-pending-rf) }
)

(define-read-only (get-claim-id)
  (var-get claim-id)
)

(define-read-only (get-express-limit)
  (var-get express-limit)
)

(define-read-only (get-effective-express-limit)
  (let (
    (reset-ts (+ (get-last-express-ts) (get-express-window)))
    (total-supply (unwrap-panic (contract-call? .hbtc-token get-total-supply)))
    (limit (if (get-express-limit-enabled)
      (if (>= stacks-block-time reset-ts)
        (/ (* total-supply (get-express-limit)) bps-base)
        (var-get current-express-limit)
      )
      total-supply) ;; return total supply when limit is disabled
    )
  )
    { shares: limit, assets: (convert-to-assets limit), reset-ts: reset-ts, enabled: (get-express-limit-enabled) }
  )
)

(define-read-only (get-express-window)
  (var-get express-window)
)

(define-read-only (get-last-express-ts)
  (var-get last-express-ts)
)

(define-read-only (get-current-express-limit)
  (var-get current-express-limit)
)

(define-read-only (get-vault-enabled)
  (var-get vault-enabled)
)

(define-read-only (get-transfer-enabled)
  (var-get transfer-enabled)
)

(define-read-only (get-deposit-enabled)
  (var-get deposit-enabled)
)

(define-read-only (get-redeem-enabled)
  (var-get redeem-enabled)
)

(define-read-only (get-trading-enabled)
  (var-get trading-enabled)
)

(define-read-only (get-express-enabled)
  (var-get express-enabled)
)

(define-read-only (get-express-limit-enabled)
  (var-get express-limit-enabled)
)

(define-read-only (get-reward-enabled)
  (var-get reward-enabled)
)

(define-read-only (get-asset (address principal))
  (let (
    (asset-entry (default-to 
      { active: false, price-feed-id: 0x, token-base: u0, max-slippage: u0, is-stablecoin: false } 
      (map-get? assets { address: address })))
    (global-max (get-max-slippage))
    (asset-max (get max-slippage asset-entry))
    (effective-max (if (<= asset-max global-max) asset-max global-max))
  )
    (merge asset-entry { max-slippage: effective-max })
  )
)

(define-read-only (get-external (address principal))
  (get active
    (default-to 
      { active: false } 
      (map-get? externals { address: address })
    )
  )
)

(define-read-only (get-custom-cooldown (address principal) (is-express bool))
  (if is-express
    (var-get express-cooldown)
    (get cooldown
      (default-to
        { cooldown: (var-get cooldown) }
        (map-get? custom-cooldown { address: address }))))
)

(define-read-only (get-custom-exit-fee (address principal) (is-express bool))
  (if is-express
    (get express-fee (get-fees))
    (get exit-fee
      (default-to
        { exit-fee: (get exit-fee (get-fees)) }
        (map-get? custom-exit-fee { address: address })))
  )
)

(define-read-only (get-update-request (type (buff 1)) (address (optional principal)))
  (match (map-get? update-requests { type: type, address: address })
    entry (ok entry)
    ERR_NO_ENTRY
  )
)

(define-read-only (get-update-request-var (type (buff 1)))
  (get-update-request type none)
)

;;-------------------------------------
;; Batch State Getters (Optimization)
;;-------------------------------------

;; @desc - Batch getter for controller reward operations
(define-read-only (get-reward-state)
  { total-assets: (get-total-assets), net-assets: (get-net-assets), fees: (get-fees), pending-rf: (get-pending-rf), reserve-rate: (get-reserve-rate) }
)

;; @desc - Batch getter for deposit operation 
(define-read-only (get-deposit-state (assets-in uint))
  { shares: (convert-to-shares assets-in), net-assets: (get-net-assets), deposit-cap: (get-deposit-cap), min-deposit: (get-min-deposit) }
)

;; @desc - Batch getter for redeem operation 
(define-read-only (get-redeem-state (user principal) (is-express bool))
  { share-price: (get-share-price), exit-fee: (get-custom-exit-fee user is-express), cooldown: (get-custom-cooldown user is-express), min-redeem: (get-min-redeem) }
)

;;-------------------------------------
;; Checks
;;-------------------------------------

(define-read-only (check-is-vault-enabled)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (ok (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED))
  )
)

(define-read-only (check-is-deposit-enabled)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED)
    (ok (asserts! (var-get deposit-enabled) ERR_DEPOSIT_DISABLED))
  )
)

(define-read-only (check-is-redeem-enabled)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED)
    (ok (asserts! (var-get redeem-enabled) ERR_REDEEM_DISABLED))
  )
)

(define-read-only (check-is-express-enabled)
  (ok (asserts! (var-get express-enabled) ERR_EXPRESS_DISABLED))
)

(define-read-only (check-is-transfer-enabled)
  (ok (asserts! (var-get transfer-enabled) ERR_TRANSFER_DISABLED))
)

(define-read-only (check-is-trading-enabled)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED)
    (ok (asserts! (var-get trading-enabled) ERR_TRADING_DISABLED))
  )
)

(define-read-only (check-is-reward-enabled)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (ok (asserts! (var-get reward-enabled) ERR_REWARD_DISABLED))
  )
)

(define-read-only (check-is-asset (address principal))
  (ok (asserts! (get active (get-asset address)) ERR_NOT_ASSET))
)

(define-read-only (check-is-external (address principal))
  (ok (asserts! (get-external address) ERR_NOT_EXTERNAL))
)

(define-read-only (check-update-window)
  (ok (asserts! (>= stacks-block-time (+ (get-last-log-ts) (get-update-window))) ERR_WINDOW_CLOSED))
)

(define-read-only (check-max-reward (amount uint))
    (ok (asserts! (<= amount (/ (* (get-max-reward) (get-total-assets)) bps-base)) ERR_ABOVE_MAX))
)

;; Share Price Protection
(define-read-only (check-max-deviation (old-price uint) (new-price uint) (share-supply uint))
  (let (
    (threshold (get-max-deviation))
    (abs-diff (if (> new-price old-price) 
                  (- new-price old-price) 
                  (- old-price new-price)))
    (deviation (if (> share-supply u0)
                  (/ (* abs-diff bps-base) old-price)
                  u0))  ;; Handle edge case of last redeem
  )
    (ok (asserts! (<= deviation threshold) ERR_DEVIATION))
  )
)

(define-public (check-redeem-auth (shares uint) (is-express bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED)
    (asserts! (var-get redeem-enabled) ERR_REDEEM_DISABLED)
    (if is-express 
      (begin
        (asserts! (var-get express-enabled) ERR_EXPRESS_DISABLED)
        (if (get-express-limit-enabled)
          (try! (consume-express-limit shares))
          true)
        (ok true)
      )
      (ok true)
    )
  )
)

(define-read-only (check-transfer-auth (asset principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-enabled))
    (asserts! (var-get vault-enabled) ERR_VAULT_DISABLED)
    (asserts! (var-get transfer-enabled) ERR_TRANSFER_DISABLED)
    (check-is-asset asset)
  )
)

(define-read-only (check-trading-auth (address-1 principal) (address-2 (optional principal)) (asset-1 (optional principal)) (asset-2 (optional principal)))
  (begin
    (try! (check-is-trading-enabled))
    (try! (check-is-external address-1))
    (match address-2 value (try! (check-is-external value)) true)
    (match asset-1 value (try! (check-is-asset value)) true)
    (ok (match asset-2 value (try! (check-is-asset value)) true))
  )
)

;;-------------------------------------
;; Protocol/Internal State Updates
;;-------------------------------------

(define-private (update-total-assets (amount uint) (is-add bool))
  (let (
    (current (get-total-assets))
    (new (if is-add (+ current amount) (- current amount)))
  )
    (var-set total-assets new)
    (print { action: "update-total-assets", data: { old: current, new: new, is-add: is-add } })
    (ok true)
  )
)

(define-private (update-shares (amount uint) (is-add bool) (user principal) (current-supply uint))
  (let (
    (new-supply (if is-add (+ current-supply amount) (- current-supply amount)))
  )
    (if is-add 
      (try! (contract-call? .hbtc-token mint-for-protocol amount user)) 
      (try! (contract-call? .hbtc-token burn-for-protocol amount user)))
    (print { action: "update-shares", data: { old: current-supply, new: new-supply, user: user, is-add: is-add } })
    (ok new-supply)
  )
)

(define-private (update-pending-fees (amount uint) (is-add bool))
  (let (
    (current (get-pending-fees))
    (new (if is-add (+ current amount) (- current amount)))
  )
    (var-set pending-fees new)
    (print { action: "update-pending-fees", data: { old: current, new: new, is-add: is-add } })
    (ok true)
  )
)

(define-private (update-pending-rf (amount uint) (is-add bool))
  (let (
    (current (get-pending-rf))
    (new (if is-add (+ current amount) (- current amount)))
  )
    (var-set pending-rf new)
    (print { action: "update-pending-rf", data: { old: current, new: new, is-add: is-add } })
    (ok true)
  )
)

(define-private (update-last-log-ts)
  (begin
    (print { action: "update-last-log-ts", data: { old: (get-last-log-ts), new: stacks-block-time } })
    (var-set last-log-ts stacks-block-time)
  )
)

;; Helper to execute a single update operation
(define-private (execute-update 
  (op { type: (string-ascii 14), amount: uint, is-add: bool })
  (prev (response bool uint)))
  (begin
    (try! prev)
    (if (is-eq (get type op) "total-assets")
      (update-total-assets (get amount op) (get is-add op))
      (if (is-eq (get type op) "pending-fees")
        (update-pending-fees (get amount op) (get is-add op))
        (if (is-eq (get type op) "pending-rf")
          (update-pending-rf (get amount op) (get is-add op))
          ERR_INVALID)))
  )
)

(define-public (update-state 
  (operations (list 10 { type: (string-ascii 14), amount: uint, is-add: bool }))
  (reward (optional { reward: uint, is-add: bool }))
  (shares (optional { amount: uint, is-add: bool, user: principal })))
  (let (
    (init-share-price (get-share-price))
    (init-total-assets (get-total-assets))
    (current-share-supply (unwrap-panic (contract-call? .hbtc-token get-total-supply)))
  )
    (try! (contract-call? .hq-hbtc check-is-protocol contract-caller))
    (asserts! (> (len operations) u0) ERR_NO_OPERATIONS)
    
    ;; Execute all operations
    (try! (fold execute-update operations (ok true)))
    
    (let ((post-share-supply
        (match shares
          data (try! (update-shares (get amount data) (get is-add data) (get user data) current-share-supply))
          current-share-supply))
    )
      ;; Optionally handle commit-reward logic
      (match reward
        data (begin
          (try! (check-max-reward (get reward data)))
          (try! (check-update-window))
          (asserts! (> (unwrap-panic (contract-call? .hbtc-token get-total-supply)) u0) ERR_ZERO_SUPPLY)
          (unwrap-panic (update-total-assets (get reward data) (get is-add data)))
          (update-last-log-ts)
          (print { action: "commit-reward", user: contract-caller, data: { 
            share-price: { old: init-share-price, new: (get-share-price) },
            total-assets: { old: init-total-assets, new: (get-total-assets) },
            reward: data,
            log-ts: (get-last-log-ts),
          } })
          true)
        true)
      
      ;; Check share price deviation after all updates
      (let (
        (new-share-price (get-share-price))
      )
        (try! (check-max-deviation init-share-price new-share-price post-share-supply))
        
        (print { action: "update-state", user: contract-caller, data: { operations: operations, shares: shares, share-price: { old: init-share-price, new: new-share-price } } })
        (ok true)
      ))
  )
)

(define-public (increment-claim-id)
  (let (
    (current-id (get-claim-id))
    (new-id (+ current-id u1))
  )
    (try! (contract-call? .hq-hbtc check-is-protocol contract-caller))
    (var-set claim-id new-id)
    (print { action: "increment-claim-id", user: contract-caller, data: { old: current-id, new: new-id } })
    (ok new-id)
  )
)

;;-------------------------------------
;; Express Limit Helpers
;;-------------------------------------

;; @desc - Consume express limit when express claim is created
(define-private (consume-express-limit (shares uint))
  (let (
    (is-reset (if (>= stacks-block-time (+ (get-last-express-ts) (get-express-window))) true false))
    (total-supply (unwrap-panic (contract-call? .hbtc-token get-total-supply)))
    (limit (if is-reset
      (/ (* total-supply (get-express-limit)) bps-base)
      (get-current-express-limit)))
  )
    (asserts! (<= shares limit) ERR_LIMIT_EXCEEDED)
    (if (contract-call? .hq-hbtc get-protocol contract-caller)
      (begin
        (print { action: "consume-express-limit", user: contract-caller, data: { old: (get-current-express-limit), new: (- limit shares) , is-reset: is-reset } })
        (if is-reset (var-set last-express-ts stacks-block-time) true)
        (var-set current-express-limit (- limit shares))
        (ok true))
      (ok true) ;; if not hq, no limit consumption
    )
  )
)


;;-------------------------------------
;; Timelocked Update Helpers
;;-------------------------------------

(define-private (request-update (type (buff 1)) (address (optional principal)) (value (optional uint)) (is-add bool) (asset-config (optional {
  price-feed-id: (buff 32),
  token-base: uint,
  max-slippage: uint,
  is-stablecoin: bool
})))
  (let (
    (activation-ts (+ stacks-block-time (contract-call? .hq-hbtc get-timelock)))
    (new-entry { ts: activation-ts, value: value, is-add: is-add, asset-config: asset-config })
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "request-update", user: contract-caller, data: { type: type, address: address, entry: new-entry } })
    (ok (asserts! (map-insert update-requests { type: type, address: address } new-entry) ERR_DUPLICATE))
  )
)

(define-private (request-var-update (type (buff 1)) (value uint))
  (request-update type none (some value) false none)
)

(define-private (request-map-update (type (buff 1)) (address principal) (is-add bool) (asset-config (optional {
  price-feed-id: (buff 32),
  token-base: uint,
  max-slippage: uint,
  is-stablecoin: bool
})))
  (request-update type (some address) none is-add asset-config)
)

(define-private (cancel-update (type (buff 1)) (address (optional principal)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (is-some (map-get? update-requests { type: type, address: address })) ERR_NO_ENTRY)
    (print { action: "cancel-update", user: contract-caller, data: { type: type, address: address } })
    (ok (map-delete update-requests { type: type, address: address }))
  )
)

(define-private (cancel-var-update (type (buff 1)))
  (cancel-update type none)
)

(define-private (cancel-map-update (type (buff 1)) (address principal))
  (cancel-update type (some address))
)

(define-private (execute-var-update (type (buff 1)) (val uint))
  (if (is-eq type MAX_REWARD) (var-set max-reward val)
  (if (is-eq type MAX_DEVIATION) (var-set max-deviation val)
  (if (is-eq type MAX_SLIPPAGE) (var-set max-slippage val)
  (if (is-eq type MIN_REDEEM) (var-set min-redeem val)
  (if (is-eq type COOLDOWN) (var-set cooldown val)
  (if (is-eq type UPDATE_WINDOW) (var-set update-window val)
  (if (is-eq type EXPRESS_COOLDOWN) (var-set express-cooldown val)
  (if (is-eq type EXPRESS_LIMIT) (var-set express-limit val)
  (if (is-eq type EXPRESS_WINDOW) (var-set express-window val)
  false))))))))) ;; if no match, return false
)

(define-private (execute-map-update 
  (type (buff 1)) 
  (addr principal) 
  (is-add bool)
  (asset-config (optional { price-feed-id: (buff 32), token-base: uint, max-slippage: uint, is-stablecoin: bool})))
  (if (and (is-eq type ASSET) is-add)
    (match asset-config
      data (map-set assets { address: addr } { active: true, price-feed-id: (get price-feed-id data), token-base: (get token-base data), max-slippage: (get max-slippage data), is-stablecoin: (get is-stablecoin data) })
      false)
  (if (and (is-eq type ASSET) (not is-add))
    (map-delete assets { address: addr })
  (if (and (is-eq type EXTERNAL) is-add)
    (map-set externals { address: addr } { active: true })
  (if (and (is-eq type EXTERNAL) (not is-add))
    (map-delete externals { address: addr })
  false)))) ;; if no match, return false
) 

(define-private (confirm-update (type (buff 1)) (address (optional principal)))
  (let (
    (entry (try! (get-update-request type address)))
    (value (get value entry))
    (is-add (get is-add entry))
    (asset-config (get asset-config entry))
    (is-var-update (and (is-some value) (is-none address)))
    (is-map-update (and (is-none value) (is-some address)))
  )
    (try! (contract-call? .hq-hbtc check-timelock (get ts entry)))
    (asserts! (or is-var-update is-map-update) ERR_INVALID)
    (if is-var-update
      (asserts! (execute-var-update type (unwrap-panic value)) ERR_INVALID_TYPE)
      (asserts! (execute-map-update type (unwrap-panic address) is-add asset-config) ERR_INVALID_TYPE))
    (print { action: "confirm-update", user: contract-caller, data: { type: type, address: address, value: value, is-add: is-add, asset-config: asset-config } })
    (ok (map-delete update-requests { type: type, address: address }))
  )
)

(define-private (confirm-var-update (type (buff 1)))
  (confirm-update type none)
)

(define-private (confirm-map-update (type (buff 1)) (address principal))
  (confirm-update type (some address))
)

;; Var updates
(define-public (request-max-reward-update (new-value uint))
  (begin
    (asserts! (<= new-value bps-base) ERR_ABOVE_MAX)
    (request-var-update MAX_REWARD new-value)
  )
)

(define-public (request-max-deviation-update (new-value uint))
  (begin
    (asserts! (<= new-value bps-base) ERR_ABOVE_MAX)
    (request-var-update MAX_DEVIATION new-value)
  )
)

(define-public (request-max-slippage-update (new-value uint))
  (begin
    (asserts! (<= new-value bps-base) ERR_ABOVE_MAX)
    (request-var-update MAX_SLIPPAGE new-value)
  )
)

(define-public (request-min-redeem-update (new-value uint))
  (begin
    (asserts! (> new-value u0) ERR_BELOW_MIN)
    (request-var-update MIN_REDEEM new-value)
  )
)

(define-public (request-cooldown-update (new-value uint))
  (begin
    (asserts! (<= new-value (get cooldown max)) ERR_ABOVE_MAX)
    (asserts! (>= new-value (get-express-cooldown)) ERR_BELOW_MIN)
    ;; Also check against pending express cooldown if exists
    (match (get-update-request-var EXPRESS_COOLDOWN)
      entry (asserts! (>= new-value (unwrap-panic (get value entry))) ERR_BELOW_MIN)
      no-entry true
    )
    (request-var-update COOLDOWN new-value)
  )
)

(define-public (request-express-cooldown-update (new-value uint))
  (begin
    (asserts! (<= new-value (get-cooldown)) ERR_ABOVE_MAX)
    ;; Also check against pending cooldown if exists
    (match (get-update-request-var COOLDOWN)
      entry (asserts! (<= new-value (unwrap-panic (get value entry))) ERR_INVALID)
      no-entry true
    )
    (request-var-update EXPRESS_COOLDOWN new-value)
  )
)

(define-public (request-express-limit-update (new-value uint))
  (begin
    (asserts! (<= new-value bps-base) ERR_ABOVE_MAX)
    (request-var-update EXPRESS_LIMIT new-value)
  )
)

(define-public (request-express-window-update (new-value uint))
  (begin
    (asserts! (> new-value u0) ERR_BELOW_MIN)
    (request-var-update EXPRESS_WINDOW new-value)
  )
)

(define-public (request-update-window-update (new-value uint))
  (begin
    (asserts! (>= new-value u1) ERR_BELOW_MIN)
    (request-var-update UPDATE_WINDOW new-value)
  )
)

;; Var cancels
(define-public (cancel-max-reward-request)
  (cancel-var-update MAX_REWARD)
)

(define-public (cancel-max-deviation-request)
  (cancel-var-update MAX_DEVIATION)
)

(define-public (cancel-max-slippage-request)
  (cancel-var-update MAX_SLIPPAGE)
)

(define-public (cancel-min-redeem-request)
  (cancel-var-update MIN_REDEEM)
)

(define-public (cancel-cooldown-request)
  (cancel-var-update COOLDOWN)
)

(define-public (cancel-express-cooldown-request)
  (cancel-var-update EXPRESS_COOLDOWN)
)

(define-public (cancel-express-limit-request)
  (cancel-var-update EXPRESS_LIMIT)
)

(define-public (cancel-express-window-request)
  (cancel-var-update EXPRESS_WINDOW)
)

(define-public (cancel-update-window-request)
  (cancel-var-update UPDATE_WINDOW)
)

;; Var confirms
(define-public (confirm-max-reward-request)
  (confirm-var-update MAX_REWARD)
)

(define-public (confirm-max-deviation-request)
  (confirm-var-update MAX_DEVIATION)
)

(define-public (confirm-max-slippage-request)
  (confirm-var-update MAX_SLIPPAGE)
)

(define-public (confirm-min-redeem-request)
  (confirm-var-update MIN_REDEEM)
)

(define-public (confirm-cooldown-request)
  (confirm-var-update COOLDOWN)
)

(define-public (confirm-express-cooldown-request)
  (confirm-var-update EXPRESS_COOLDOWN)
)

(define-public (confirm-express-limit-request)
  (confirm-var-update EXPRESS_LIMIT)
)

(define-public (confirm-express-window-request)
  (confirm-var-update EXPRESS_WINDOW)
)

(define-public (confirm-update-window-request)
  (confirm-var-update UPDATE_WINDOW)
)

;;-------------------------------------
;; Asset updates
;;-------------------------------------

(define-public (request-asset-add (token <ft>) (price-feed-id (buff 32)) (decimals uint) (asset-max-slippage uint) (is-stablecoin bool))
  (let (
    (token-contract (contract-of token))
    (token-decimals (try! (contract-call? token get-decimals)))
    (token-base (pow u10 token-decimals))
  )
    (asserts! (is-none (map-get? assets { address: token-contract })) ERR_DUPLICATE)
    (asserts! (<= asset-max-slippage (get-max-slippage)) ERR_ABOVE_MAX)
    (asserts! (is-eq token-decimals decimals) ERR_INVALID_DECIMALS)
    (request-map-update ASSET token-contract true (some {
      price-feed-id: price-feed-id,
      token-base: token-base,
      max-slippage: asset-max-slippage,
      is-stablecoin: is-stablecoin
    }))
  )
)

(define-public (request-asset-remove (address principal))
  (begin
    (asserts! (is-some (map-get? assets { address: address })) ERR_NO_ENTRY)
    (request-map-update ASSET address false none)
  )
)

(define-public (cancel-asset-request (address principal))
  (cancel-map-update ASSET address)
)

(define-public (confirm-asset-request (address principal))
  (confirm-map-update ASSET address)
)

;;-------------------------------------
;; External updates
;;-------------------------------------

(define-public (request-external-add (address principal))
  (begin
    (asserts! (not (get-external address)) ERR_DUPLICATE)
    (request-map-update EXTERNAL address true none)
  )
)

(define-public (request-external-remove (address principal))
  (begin
    (asserts! (is-some (map-get? externals { address: address })) ERR_NO_ENTRY)
    (request-map-update EXTERNAL address false none)
  )
)

(define-public (cancel-external-request (address principal))
  (cancel-map-update EXTERNAL address)
)

(define-public (confirm-external-request (address principal))
  (confirm-map-update EXTERNAL address)
)

;;-------------------------------------
;; Setters
;;-------------------------------------

(define-public (set-fee-address (address principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (contract-call? .hq-hbtc check-is-standard address))
    (print { action: "set-fee-address", user: contract-caller, data: { old: (get-fee-address), new: address } })
    (ok (var-set fee-address address))
  )
)

(define-public (set-fees (mgmt-fee uint) (perf-fee uint) (exit-fee uint) (express-fee uint))
  (let (
    (current-fees (get-fees))
    (last-ts (get-last-log-ts))
    (new-fees { mgmt-fee: mgmt-fee, perf-fee: perf-fee, exit-fee: exit-fee, express-fee: express-fee })
    (mgmt-changed (not (is-eq mgmt-fee (get mgmt-fee current-fees))))
    (perf-changed (not (is-eq perf-fee (get perf-fee current-fees))))
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= mgmt-fee (get mgmt-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= perf-fee (get perf-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= exit-fee (get exit-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= express-fee (get express-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= exit-fee express-fee) ERR_INVALID)
    (if (or mgmt-changed perf-changed)
      (asserts! (or (<= stacks-block-time (+ last-ts one-hour)) (is-eq last-ts u0)) ERR_FEE_WINDOW)
      true)
    (print { action: "set-fees", user: contract-caller, data: { old: current-fees, new: new-fees } })
    (ok (var-set fees new-fees))
  )
)

(define-public (set-custom-exit-fee (address principal) (new-exit-fee uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (asserts! (<= new-exit-fee (get exit-fee max)) ERR_ABOVE_MAX)
    (print { action: "set-custom-exit-fee", user: contract-caller, data: { address: address, old: (get-custom-exit-fee address false), new: new-exit-fee } })
    (ok (map-set custom-exit-fee { address: address } { exit-fee: new-exit-fee }))
  )
)

(define-public (remove-custom-exit-fee (address principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (print { action: "remove-custom-exit-fee", user: contract-caller, data: { address: address } })
    (ok (asserts! (map-delete custom-exit-fee { address: address }) ERR_NO_ENTRY))
  )
)

(define-private (set-custom-exit-fee-iter (entry { address: principal, new-exit-fee: uint }) (prev (response bool uint)))
  (let (
    (address (get address entry))
    (new-exit-fee (get new-exit-fee entry))
  )
    (try! prev)
    (asserts! (<= new-exit-fee (get exit-fee max)) ERR_ABOVE_MAX)
    (print { action: "set-custom-exit-fee-iter", user: contract-caller, data: { address: address, old: (get-custom-exit-fee address false), new: new-exit-fee } })
    (ok (map-set custom-exit-fee { address: address } { exit-fee: new-exit-fee }))
  )
)

(define-public (set-custom-exit-fee-many (entries (list 200 { address: principal, new-exit-fee: uint })))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (asserts! (> (len entries) u0) ERR_INVALID)
    (print { action: "set-custom-exit-fee-many", user: contract-caller, data: { entries: entries } })
    (fold set-custom-exit-fee-iter entries (ok true))
  )
)

(define-private (remove-custom-exit-fee-iter (address principal) (prev (response bool uint)))
  (ok (and (try! prev) (asserts! (map-delete custom-exit-fee { address: address }) ERR_NO_ENTRY))))

(define-public (remove-custom-exit-fee-many (addresses (list 200 principal)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (asserts! (> (len addresses) u0) ERR_INVALID)
    (print { action: "remove-custom-exit-fee-many", user: contract-caller, data: { addresses: addresses } })
    (fold remove-custom-exit-fee-iter addresses (ok true))
  )
)

(define-public (set-custom-cooldown (address principal) (new-cooldown uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= new-cooldown (get cooldown max)) ERR_ABOVE_MAX)
    (print { action: "set-custom-cooldown", user: contract-caller, data: { address: address, old: (get-custom-cooldown address false), new: new-cooldown } })
    (ok (map-set custom-cooldown { address: address } { cooldown: new-cooldown }))
  )
)

(define-public (remove-custom-cooldown (address principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "remove-custom-cooldown", user: contract-caller, data: { address: address } })
    (ok (asserts! (map-delete custom-cooldown { address: address }) ERR_NO_ENTRY))
  )
)

(define-public (set-deposit-cap (new-deposit-cap uint))  
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-deposit-cap", user: contract-caller, data: { old: (get-deposit-cap), new: new-deposit-cap } })
    (ok (var-set deposit-cap new-deposit-cap))
  )
)

(define-public (set-min-deposit (new-min-deposit uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (> new-min-deposit u0) ERR_BELOW_MIN)
    (print { action: "set-min-deposit", user: contract-caller, data: { old: (get-min-deposit), new: new-min-deposit } })
    (ok (var-set min-deposit new-min-deposit))
  )
)

(define-public (set-reserve-rate (new-reserve-rate uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= new-reserve-rate (get reserve-rate max)) ERR_ABOVE_MAX)
    (print { action: "set-reserve-rate", user: contract-caller, data: { old: (get-reserve-rate), new: new-reserve-rate } })
    (ok (var-set reserve-rate new-reserve-rate))
  )
)

(define-public (set-staleness-window (new-staleness-window uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-staleness-window", user: contract-caller, data: { old: (get-staleness-window), new: new-staleness-window } })
    (ok (var-set staleness-window new-staleness-window))
  )
)

(define-public (set-vault-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-vault-enabled", user: contract-caller, data: { old: (get-vault-enabled), new: enabled } })
    (ok (var-set vault-enabled enabled))
  )
)

(define-public (disable-vault)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-vault", user: contract-caller, data: { old: (get-vault-enabled), new: false } })
    (ok (var-set vault-enabled false))
  )
)

(define-public (set-transfer-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-transfer-enabled", user: contract-caller, data: { old: (get-transfer-enabled), new: enabled } })
    (ok (var-set transfer-enabled enabled))
  )
)

(define-public (disable-transfer)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-transfer", user: contract-caller, data: { old: (get-transfer-enabled), new: false } })
    (ok (var-set transfer-enabled false))
  )
)

(define-public (set-deposit-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-deposit-enabled", user: contract-caller, data: { old: (get-deposit-enabled), new: enabled } })
    (ok (var-set deposit-enabled enabled))
  )
)

(define-public (disable-deposits)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-deposits", user: contract-caller, data: { old: (get-deposit-enabled), new: false } })
    (ok (var-set deposit-enabled false))
  )
)

(define-public (set-redeem-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-redeem-enabled", user: contract-caller, data: { old: (get-redeem-enabled), new: enabled } })
    (ok (var-set redeem-enabled enabled))
  )
)

(define-public (disable-redeem)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-redeem", user: contract-caller, data: { old: (get-redeem-enabled), new: false } })
    (ok (var-set redeem-enabled false))

  )
)

(define-public (set-trading-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-trading-enabled", user: contract-caller, data: { old: (get-trading-enabled), new: enabled } })
    (ok (var-set trading-enabled enabled))
  )
)

(define-public (disable-trading)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-trading", user: contract-caller, data: { old: (get-trading-enabled), new: false } })
    (ok (var-set trading-enabled false))
  )
)

(define-public (set-express-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-express-enabled", user: contract-caller, data: { old: (get-express-enabled), new: enabled } })
    (ok (var-set express-enabled enabled))
  )
)

(define-public (set-express-limit-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-express-limit-enabled", user: contract-caller, data: { old: (get-express-limit-enabled), new: enabled } })
    (ok (var-set express-limit-enabled enabled))
  )
)

(define-public (set-reward-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-reward-enabled", user: contract-caller, data: { old: (get-reward-enabled), new: enabled } })
    (ok (var-set reward-enabled enabled))
  )
)

(define-public (disable-reward)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-reward", user: contract-caller, data: { old: (get-reward-enabled), new: false } })
    (ok (var-set reward-enabled false))
  )
)

(define-public (set-asset-slippage (address principal) (new-slippage uint))
  (let (
    (entry (get-asset address))
    (updated-entry (merge entry { max-slippage: new-slippage }))
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (check-is-asset address))
    (asserts! (<= new-slippage (get-max-slippage)) ERR_ABOVE_MAX)
    (print { action: "set-asset-slippage", user: contract-caller, data: { address: address, old: entry, new: updated-entry } })
    (ok (map-set assets { address: address } updated-entry))
  )
)
