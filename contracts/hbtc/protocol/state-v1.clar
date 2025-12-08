;; @contract Vault State
;; @version 1
;; @desc State contract for hBTC protocol

(use-trait ft .sip-010-trait.sip-010-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_NOT_ASSET (err u102001))
(define-constant ERR_NOT_CONTRACT (err u102002))
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

(define-constant max {
  reward: u20,                                                    ;; [20 bps] => 0.20% - max asset reward/loss per log-reward call
  deviation: u20,                                                 ;; [20 bps] => 0.20% - max share price deviation per update
  slippage: u500,                                                 ;; [500 bps] => 5.00% - max slippage for asset trades
  mgmt-fee: u55,                                                  ;; [55 bps/10000] => 0.0055% daily (~2% annualized) - max management fee
  perf-fee: u2000,                                                ;; [2000 bps] => 20.00% - max performance fee on profits
  exit-fee: u100,                                                 ;; [100 bps] => 1.00% - max exit fee on redeems
  reserve-rate: u5000,                                            ;; [5000 bps] => 50.00% - max reserve fund allocation rate
  express-fee: u200,                                              ;; [200 bps] => 2.00% - max express redeem fee
  cooldown: u2592000,                                             ;; [2592000 seconds] => 30 days - redeem cooldown period
  staleness-window: u300,                                         ;; [300 seconds] => 5 min - price staleness check
})

(define-constant min {
  update-window: u3600,                                           ;; [3600 seconds] => 1 hour - min time between reward updates
})

(define-constant bps-base u10000)                                 ;; 10^4 = 10000 (basis points base)
(define-constant share-base u100000000)                           ;; 10^8 = 100000000 (share price base) 
(define-constant one-hour u3600)                                  ;; [3600 seconds] => 1 hour - mgmt/perf fee change window after rewards

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
(define-data-var reserve-rate uint u500)                          ;; [500 bps] => 5.00% - reserve fund allocation rate from profits (log-reward)
(define-data-var deposit-cap uint u0)                             ;; [8 decimals] - maximum total vault capacity
(define-data-var min-deposit uint u100)                           ;; [8 decimals] - minimum deposit amount
(define-data-var min-redeem uint u100)                            ;; [8 decimals] - minimum redeem amount
(define-data-var cooldown uint u259200)                           ;; [259200 seconds] => 3 days - default redeem cooldown period
(define-data-var express-cooldown uint u3600)                     ;; [3600 seconds] => 1 hour - express redeem cooldown period
(define-data-var update-window uint u82800)                       ;; [82800 seconds] => 23 hours - min time between reward updates
(define-data-var staleness-window uint u50)                       ;; [50 seconds] => ~50 seconds - price staleness check

;; Operational States
(define-data-var vault-active bool true)                          ;; vault enabled/disabled flag
(define-data-var transfer-active bool true)                       ;; vault asset transfers enabled/disabled flag (reserve, fee-collector)
(define-data-var deposit-active bool true)                        ;; deposits enabled/disabled flag
(define-data-var redeem-active bool true)                         ;; redeems enabled/disabled flag
(define-data-var trading-active bool true)                        ;; trading enabled/disabled flag
(define-data-var express-active bool true)                        ;; express redeems enabled/disabled flag

;; Accounting Variables
(define-data-var total-assets uint u0)                            ;; [8 decimals] - total assets in the reserve
(define-data-var pending-fees uint u0)                            ;; [8 decimals] - total pending fees payable to protocol
(define-data-var pending-rf uint u0)                              ;; [8 decimals] - total pending reserve fund payable to protocol
(define-data-var claim-id uint u0)                                ;; [counter] - current claim ID
(define-data-var last-log-ts uint u0)                             ;; [unix timestamp] - last reward log timestamp

;;-------------------------------------
;; Maps
;;-------------------------------------

;; sip-010 tokens that the vault can interact with
(define-map assets
  {
    address: principal                                            ;; token contract address
  }
  {
    active: bool,                                                 ;; asset enabled/disabled for trading
    ts: (optional uint),                                          ;; [unix timestamp] - activation/deactivation timestamp
    price-feed-id: (buff 32),                                     ;; [32 bytes] - Pyth price feed identifier
    token-base: uint,                                             ;; [10^decimals] - token decimal base (e.g., 10^6, 10^8)
    max-slippage: uint,                                           ;; [bps] - max swap slippage allowed for this asset
    is-stablecoin: bool,                                          ;; whether asset is USD stablecoin (affects pricing logic)
  }
)

;; external contracts that the vault can interact with 
(define-map contracts 
  {
    address: principal                                            ;; external contract address
  }
  {
    active: bool,                                                 ;; connection enabled/disabled
    ts: (optional uint)                                           ;; [unix timestamp] - activation timestamp
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

;;-------------------------------------
;; Helper
;;-------------------------------------

(define-private (get-current-ts)
  (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1)))
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

(define-read-only (get-vault-active)
  (var-get vault-active)
)

(define-read-only (get-transfer-active)
  (var-get transfer-active)
)

(define-read-only (get-deposit-active)
  (var-get deposit-active)
)

(define-read-only (get-redeem-active)
  (var-get redeem-active)
)

(define-read-only (get-trading-active)
  (var-get trading-active)
)

(define-read-only (get-express-active)
  (var-get express-active)
)

(define-read-only (get-asset (address principal))
  (default-to 
    { active: false, ts: none, price-feed-id: 0x, token-base: u0, max-slippage: u0, is-stablecoin: false } 
    (map-get? assets { address: address })
  )
)

(define-read-only (get-contract (address principal))
  (default-to 
    { active: false, ts: none } 
    (map-get? contracts { address: address })
  )
)

(define-read-only (get-custom-cooldown (address principal) (is-express bool))
  (if is-express
    (get-express-cooldown)
    (get cooldown
      (default-to
        { cooldown: (get-cooldown) }
        (map-get? custom-cooldown { address: address })))
  )
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

;;-------------------------------------
;; Batch State Getters (Optimization)
;;-------------------------------------

;; @desc - Batch getter for controller reward operations
(define-read-only (get-reward-state)
  { total-assets: (get-total-assets), net-assets: (get-net-assets), fees: (get-fees), pending-rf: (get-pending-rf), reserve-rate: (get-reserve-rate) }
)

;; @desc - Batch getter for deposit operation - returns all state needed for deposit validation
(define-read-only (get-deposit-state (assets-in uint))
  { shares: (convert-to-shares assets-in), net-assets: (get-net-assets), deposit-cap: (get-deposit-cap), min-deposit: (get-min-deposit) }
)

;; @desc - Batch getter for redeem operation - returns all data needed
(define-read-only (get-redeem-state (user principal) (is-express bool))
  { share-price: (get-share-price), exit-fee: (get-custom-exit-fee user is-express), cooldown: (get-custom-cooldown user is-express), min-redeem: (get-min-redeem) }
)

;;-------------------------------------
;; Checks
;;-------------------------------------

(define-read-only (check-is-vault-active)
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol-active))
    (ok (asserts! (get-vault-active) ERR_VAULT_DISABLED))
  )
)

(define-read-only (check-is-deposit-active)
  (begin
    (try! (check-is-vault-active))
    (ok (asserts! (get-deposit-active) ERR_DEPOSIT_DISABLED))
  )
)

(define-read-only (check-is-redeem-active)
  (begin
    (try! (check-is-vault-active))
    (ok (asserts! (get-redeem-active) ERR_REDEEM_DISABLED))
  )
)

(define-read-only (check-redeem-auth (is-express bool))
  (begin
    (try! (check-is-redeem-active))
    (if is-express (check-is-express-active) (ok true))
  )
)

(define-read-only (check-is-express-active)
  (ok (asserts! (get-express-active) ERR_EXPRESS_DISABLED))
)

(define-read-only (check-is-transfer-active)
  (ok (asserts! (get-transfer-active) ERR_TRANSFER_DISABLED))
)

(define-read-only (check-transfer-auth (asset principal))
  (begin
    (try! (check-is-vault-active))
    (try! (check-is-transfer-active))
    (check-is-asset asset)
  )
)

(define-read-only (check-is-trading-active)
  (begin
    (try! (check-is-vault-active))
    (ok (asserts! (get-trading-active) ERR_TRADING_DISABLED))
  )
) 

(define-read-only (check-is-asset (address principal))
  (ok (asserts! (get active (get-asset address)) ERR_NOT_ASSET))
)

(define-read-only (check-is-contract (address principal))
  (ok (asserts! (get active (get-contract address)) ERR_NOT_CONTRACT))
)

(define-read-only (check-update-window)
  (ok (asserts! (>= (get-current-ts) (+ (get-last-log-ts) (get-update-window))) ERR_WINDOW_CLOSED))
)

(define-read-only (check-max-reward (amount uint))
    (ok (asserts! (<= amount (/ (* (get-max-reward) (get-total-assets)) bps-base)) ERR_ABOVE_MAX))
)

(define-read-only (check-trading-auth (contract-1 principal) (contract-2 (optional principal)) (asset-1 (optional principal)) (asset-2 (optional principal)))
  (begin
    (try! (check-is-trading-active))
    (try! (check-is-contract contract-1))
    (match contract-2 value (try! (check-is-contract value)) true)
    (match asset-1 value (try! (check-is-asset value)) true)
    (ok (match asset-2 value (try! (check-is-asset value)) true))
  )
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
  (let (
    (current (get-current-ts))
  )
    (print { action: "update-last-log-ts", data: { old: (get-last-log-ts), new: current } })
    (var-set last-log-ts current)
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

;; PUBLIC: Batch update with share price protection and optional commit-reward and shares update
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
    
    ;; Execute ALL operations before checking
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
      
      ;; POST-CONDITION: Check share price deviation after all updates
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
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (<= mgmt-fee (get mgmt-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= perf-fee (get perf-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= exit-fee (get exit-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= express-fee (get express-fee max)) ERR_ABOVE_MAX)
    (asserts! (<= exit-fee express-fee) ERR_INVALID)
    (if (or mgmt-changed perf-changed)
      (asserts! (or (<= (get-current-ts) (+ last-ts one-hour)) (is-eq last-ts u0)) ERR_FEE_WINDOW)
      true)
    (print { action: "set-fees", user: contract-caller, data: { old: current-fees, new: new-fees } })
    (ok (var-set fees new-fees))
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

(define-public (set-custom-exit-fee (entries (list 200 { address: principal, new-exit-fee: uint })))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (print { action: "set-custom-exit-fee", user: contract-caller, data: { entries: entries } })
    (fold set-custom-exit-fee-iter entries (ok true))
  )
)

(define-private (remove-custom-exit-fee-iter (address principal) (prev (response bool uint)))
  (ok (and (try! prev) (map-delete custom-exit-fee { address: address }))))

(define-public (remove-custom-exit-fee (addresses (list 200 principal)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-fee-setter contract-caller))
    (print { action: "remove-custom-exit-fee", user: contract-caller, data: { addresses: addresses } })
    (fold remove-custom-exit-fee-iter addresses (ok true))
  )
)

(define-public (set-cooldown (new-cooldown uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (<= new-cooldown (get cooldown max) ) ERR_ABOVE_MAX)
    (asserts! (>= new-cooldown (get-express-cooldown)) ERR_INVALID)
    (print { action: "set-cooldown", user: contract-caller, data: { old: (get-cooldown), new: new-cooldown } })
    (ok (var-set cooldown new-cooldown))
  )
)

(define-public (set-express-cooldown (new-cooldown uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (<= new-cooldown (get cooldown max)) ERR_ABOVE_MAX)
    (asserts! (<= new-cooldown (get-cooldown)) ERR_INVALID)
    (print { action: "set-express-cooldown", user: contract-caller, data: { old: (get-express-cooldown), new: new-cooldown } })
    (ok (var-set express-cooldown new-cooldown))
  )
)

(define-private (set-custom-cooldown-iter (entry { address: principal, new-cooldown: uint }) (prev (response bool uint)))
  (let (
    (address (get address entry))
    (new-cooldown (get new-cooldown entry))
  )
    (try! prev)
    (asserts! (<= new-cooldown (get cooldown max)) ERR_ABOVE_MAX)
    (print { action: "set-custom-cooldown-iter", user: contract-caller, data: { address: address, old: (get-custom-cooldown address false), new: new-cooldown } })
    (ok (map-set custom-cooldown { address: address } { cooldown: new-cooldown }))
  )
)

(define-public (set-custom-cooldown (entries (list 200 { address: principal, new-cooldown: uint })))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-custom-cooldown", user: contract-caller, data: { entries: entries } })
    (fold set-custom-cooldown-iter entries (ok true))
  )
)

(define-private (remove-custom-cooldown-iter (address principal) (prev (response bool uint)))
  (ok (and (try! prev) (map-delete custom-cooldown { address: address }))))

(define-public (remove-custom-cooldown (addresses (list 200 principal)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "remove-custom-cooldown", user: contract-caller, data: { addresses: addresses } })
    (fold remove-custom-cooldown-iter addresses (ok true))
  )
)

(define-public (set-deposit-cap (new-deposit-cap uint))  
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-deposit-cap", user: contract-caller, data: { old: (get-deposit-cap), new: new-deposit-cap } })
    (ok (var-set deposit-cap new-deposit-cap))
  )
)

(define-public (set-min-deposit (new-min-deposit uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (> new-min-deposit u0) ERR_BELOW_MIN)
    (print { action: "set-min-deposit", user: contract-caller, data: { old: (get-min-deposit), new: new-min-deposit } })
    (ok (var-set min-deposit new-min-deposit))
  )
)

(define-public (set-min-redeem (new-min-redeem uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (> new-min-redeem u0) ERR_BELOW_MIN)
    (print { action: "set-min-redeem", user: contract-caller, data: { old: (get-min-redeem), new: new-min-redeem } })
    (ok (var-set min-redeem new-min-redeem))
  )
)

(define-public (set-max-reward (new-max-reward uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= new-max-reward (get reward max) ) ERR_ABOVE_MAX)
    (print { action: "set-max-reward", user: contract-caller, data: { old: (get-max-reward), new: new-max-reward } })
    (ok (var-set max-reward new-max-reward))
  )
)

(define-public (set-max-deviation (new-max-deviation uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= new-max-deviation (get deviation max)) ERR_ABOVE_MAX)
    (print { action: "set-max-deviation", user: contract-caller, data: { old: (get-max-deviation), new: new-max-deviation } })
    (ok (var-set max-deviation new-max-deviation))
  )
)

(define-public (set-update-window (new-update-window uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (>= new-update-window (get update-window min) ) ERR_BELOW_MIN)
    (print { action: "set-update-window", user: contract-caller, data: { old: (get-update-window), new: new-update-window } })
    (ok (var-set update-window new-update-window))
  )
)

(define-public (set-reserve-rate (new-reserve-rate uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (asserts! (<= new-reserve-rate (get reserve-rate max)) ERR_ABOVE_MAX)
    (print { action: "set-reserve-rate", user: contract-caller, data: { old: (get-reserve-rate), new: new-reserve-rate } })
    (ok (var-set reserve-rate new-reserve-rate))
  )
)

(define-public (set-staleness-window (new-staleness-window uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= new-staleness-window (get staleness-window max) ) ERR_ABOVE_MAX)
    (print { action: "set-staleness-window", user: contract-caller, data: { old: (get-staleness-window), new: new-staleness-window } })
    (ok (var-set staleness-window new-staleness-window))
  )
)

(define-public (set-vault-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-vault-active", user: contract-caller, data: { old: (get-vault-active), new: active } })
    (ok (var-set vault-active active))
  )
)

(define-public (disable-vault)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-vault", user: contract-caller, data: { old: (get-vault-active), new: false } })
    (ok (var-set vault-active false))
  )
)

(define-public (set-transfer-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-transfer-active", user: contract-caller, data: { old: (get-transfer-active), new: active } })
    (ok (var-set transfer-active active))
  )
)

(define-public (disable-transfer)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-transfer", user: contract-caller, data: { old: (get-transfer-active), new: false } })
    (ok (var-set transfer-active false))
  )
)

(define-public (set-deposit-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-deposit-active", user: contract-caller, data: { old: (get-deposit-active), new: active } })
    (ok (var-set deposit-active active))
  )
)

(define-public (disable-deposits)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-deposits", user: contract-caller, data: { old: (get-deposit-active), new: false } })
    (ok (var-set deposit-active false))
  )
)

(define-public (set-redeem-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-redeem-active", user: contract-caller, data: { old: (get-redeem-active), new: active } })
    (ok (var-set redeem-active active))
  )
)

(define-public (disable-redeem)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-redeem", user: contract-caller, data: { old: (get-redeem-active), new: false } })
    (ok (var-set redeem-active false))

  )
)

(define-public (set-trading-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-trading-active", user: contract-caller, data: { old: (get-trading-active), new: active } })
    (ok (var-set trading-active active))
  )
)

(define-public (disable-trading)
  (begin
    (try! (contract-call? .hq-hbtc check-is-guardian contract-caller))
    (print { action: "disable-trading", user: contract-caller, data: { old: (get-trading-active), new: false } })
    (ok (var-set trading-active false))
  )
)

(define-public (set-express-active (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-admin contract-caller))
    (print { action: "set-express-active", user: contract-caller, data: { old: (get-express-active), new: active } })
    (ok (var-set express-active active))
  )
)

(define-public (request-new-asset (token <ft>) (price-feed-id (buff 32)) (max-slippage uint) (is-stablecoin bool))
  (let (
    (token-address (contract-of token))
    (token-base (pow u10 (unwrap-panic (contract-call? token get-decimals))))
    (activation-ts (+ (get-current-ts) (contract-call? .hq-hbtc get-activation-delay)))
    (new-entry { active: false, ts: (some activation-ts), price-feed-id: price-feed-id, token-base: token-base, max-slippage: max-slippage, is-stablecoin: is-stablecoin })
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= max-slippage (get slippage max) ) ERR_ABOVE_MAX)
    (print { action: "request-new-asset", user: contract-caller, data: { token-address: token-address, old: (get-asset token-address), new: new-entry } })
    (ok (asserts! (map-insert assets { address: token-address } new-entry) ERR_DUPLICATE))
  )
)

(define-public (remove-asset (address principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "remove-asset", user: contract-caller, data: { address: address, old: (get-asset address) } })
    (ok (map-delete assets { address: address }))
  )
)

(define-public (activate-asset (address principal))
  (let (
    (entry (get-asset address))
    (ts (unwrap! (get ts entry) ERR_NO_ENTRY))
    (updated-entry (merge entry { active: true }))
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (contract-call? .hq-hbtc check-activation-delay ts))
    (print { action: "activate-asset", user: contract-caller, data: { address: address, old: entry, new: updated-entry } })
    (ok (map-set assets { address: address } updated-entry))
  )
)

(define-public (set-max-slippage (address principal) (max-slippage uint))
  (let (
    (entry (get-asset address))
    (ts (unwrap! (get ts entry) ERR_NO_ENTRY))
    (updated-entry (merge entry { max-slippage: max-slippage }))
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (asserts! (<= max-slippage (get slippage max) ) ERR_ABOVE_MAX)
    (print { action: "set-max-slippage", user: contract-caller, data: { address: address, old: entry, new: updated-entry } })
    (ok (map-set assets { address: address } updated-entry))
  )
)

(define-public (request-new-contract (address principal))
  (let (
    (activation-ts (+ (get-current-ts) (contract-call? .hq-hbtc get-activation-delay)))
    (new-entry { active: false, ts: (some activation-ts) })
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (contract-call? .hq-hbtc check-is-standard address))
    (print { action: "request-new-contract", user: contract-caller, data: { address: address, old: (get-contract address), new: new-entry } })
    (ok (asserts! (map-insert contracts { address: address } new-entry) ERR_DUPLICATE))
  )
)

(define-public (remove-contract (address principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "remove-contract", user: contract-caller, data: { address: address, old: (get-contract address) } })
    (ok (map-delete contracts { address: address }))
  )
)

(define-public (activate-contract (address principal))
  (let (
    (entry (get-contract address))
    (ts (unwrap! (get ts entry) ERR_NO_ENTRY))
    (updated-entry (merge entry { active: true }))
  )
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (contract-call? .hq-hbtc check-activation-delay ts))
    (print { action: "activate-contract", user: contract-caller, data: { address: address, old: entry, new: updated-entry } })
    (ok (map-set contracts { address: address } updated-entry))
  )
)
