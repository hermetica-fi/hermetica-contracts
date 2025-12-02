;; @contract Vault
;; @version 1
;; @desc User facing vault contract for hBTC protocol

(impl-trait .vault-trait-v1.vault-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_DEPOSIT_CAP_EXCEEDED (err u103001))
(define-constant ERR_BELOW_MIN (err u103002))
(define-constant ERR_NO_CLAIM_FOR_ID (err u103003))
(define-constant ERR_NOT_COOLED_DOWN (err u103004))
(define-constant ERR_ALREADY_FUNDED (err u103005))
(define-constant ERR_NOT_FUNDED (err u103006))
(define-constant ERR_EMPTY_LIST (err u103007))

(define-constant share-base u100000000)                         ;; 10^8 = 100000000 (share price base)
(define-constant bps-base u10000)                               ;; 10^4 = 10000 (basis points base)

(define-constant this-contract (as-contract tx-sender))
(define-constant reserve .reserve)
(define-constant sbtc-token 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
(define-constant fee-collector .fee-collector)

;;-------------------------------------
;; Maps
;;-------------------------------------

(define-map claims
  { 
    claim-id: uint
  }
  {
    user: principal,
    shares: uint,                                 ;; number of hBTC shares to burn at funding time
    assets: uint,                                 ;; gross asset amount (includes fee) - calculated at funding time
    fee: uint,                                    ;; fee amount in asset
    fee-bps: uint,                                ;; fee basis points
    ts: uint,                                     ;; timestamp in s claim after cooldown
    is-funded: bool,                              ;; true if the claim has been funded
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

;; @desc - preview how many shares would be received for depositing a given asset amount
(define-read-only (preview-deposit (assets uint))
  (contract-call? .state convert-to-shares assets)
)

;; @desc - preview how many assets would be received for redeeming a given number of shares
(define-read-only (preview-redeem (shares uint))
  (contract-call? .state convert-to-assets shares)
)

(define-read-only (get-claim (id uint))
  (ok (unwrap! (map-get? claims { claim-id: id }) ERR_NO_CLAIM_FOR_ID))
)

(define-private (get-current-ts)
  (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1)))
)

;;-------------------------------------
;; User
;;-------------------------------------

;; @desc - deposit asset to mint shares
(define-public (deposit (assets uint) (affiliate (optional (buff 64))))
  (let (
    (state (contract-call? .state get-deposit-state assets))
    (shares (get shares state))
  )
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-is-deposit-active))
    (asserts! (<= (+ (get net-assets state) assets) (get deposit-cap state)) ERR_DEPOSIT_CAP_EXCEEDED)
    (asserts! (>= assets (get min-deposit state)) ERR_BELOW_MIN)

    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer assets contract-caller reserve none))
    (try! (contract-call? .state update-state
      (list
        { type: "total-assets", amount: assets, is-add: true })
      none
      (some { amount: shares, is-add: true, user: contract-caller })))
    (print { action: "deposit", user: contract-caller, data: { assets: assets, shares: shares, affiliate: affiliate, net-assets: (get net-assets state) } })
    (ok shares)
  )
)

;; @desc - creates a claim for redeem operations
(define-private (create-claim (shares uint) (exit-fee uint) (cooldown uint))
  (let (
    (new-claim-id (try! (contract-call? .state increment-claim-id)))
    (ts (+ (get-current-ts) cooldown))
  )
    ;; Transfer shares from user to vault
    (try! (contract-call? .hbtc-token transfer shares contract-caller this-contract none))
    
    (map-set claims { claim-id: new-claim-id } 
      {
        user: contract-caller,
        shares: shares,
        assets: u0,  ;; Will be calculated at funding time
        fee: u0,     ;; Will be calculated at funding time
        fee-bps: exit-fee,
        ts: ts,
        is-funded: false
      }
    )
    (print { action: "create-claim", user: contract-caller, data: { claim-id: new-claim-id, shares: shares, cooldown: cooldown, fee-bps: exit-fee, ts: ts } })
    (ok new-claim-id)
  )
)

;; @desc - creates a claim to redeem shares for assets after cooldown period has passed
(define-public (request-redeem (shares uint) (is-express bool))
  (let (
    (state (contract-call? .state get-redeem-state contract-caller is-express))
  )
    (asserts! (>= shares (get min-redeem state)) ERR_BELOW_MIN)
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-redeem-auth is-express))

    (let ((claim-id (try! (create-claim shares (get exit-fee state) (get cooldown state)))))
      (print { action: "request-redeem", user: contract-caller, data: { claim-id: claim-id, shares: shares, is-express: is-express } })
      (ok claim-id)
    )
  )
)

;; @desc - executes a claim for each claim-id in the list
(define-public (redeem-many (entries (list 1000 uint)))
  (begin
    (try! (contract-call? .state check-is-redeem-active))
    (ok (map redeem-internal entries))
  )
)

;; @desc - transfers asset to user after cooldown window has passed
(define-public (redeem (claim-id uint))
  (begin
    (try! (contract-call? .state check-is-redeem-active))
    (redeem-internal claim-id)
  )
)

;; @desc - internal function to perform the redeem operation
(define-private (redeem-internal (claim-id uint))
  (let (
    (current-claim (try! (get-claim claim-id)))
    (assets (get assets current-claim))
    (fee (get fee current-claim))
    (user (get user current-claim))
    (assets-net (- assets fee))
  )
    (asserts! (>= (get-current-ts) (get ts current-claim)) ERR_NOT_COOLED_DOWN)
    (asserts! (get is-funded current-claim) ERR_NOT_FUNDED)
    (try! (contract-call? .blacklist check-is-not-soft user))
    (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer assets-net this-contract user none)))
    (if (> fee u0)
      (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer fee this-contract fee-collector none)))
      true
    )
    (print { action: "redeem", user: contract-caller, data: { claim-id: claim-id, assets: assets, fee: fee, user: user, fee-address: fee-collector } })
    (map-delete claims { claim-id: claim-id })
    (ok assets-net)
  )
)

;;-------------------------------------
;; Protocol
;;-------------------------------------

;; @desc - Funds a single claim
(define-public (fund-claim (claim-id uint))
  (let (
    (is-manager (get manager (contract-call? .hq-hbtc get-keeper contract-caller)))
    (share-price (contract-call? .state get-share-price))
    (result (try! (process-claim claim-id share-price (some is-manager))))
    (assets (get assets result))
    (shares (get shares result))
  )
    ;; Transfer assets from reserve to vault and update state
    (try! (contract-call? .reserve transfer sbtc-token assets this-contract))
    (try! (contract-call? .state update-state 
      (list
        { type: "total-assets", amount: assets, is-add: false })
      none
      (some { amount: shares, is-add: false, user: this-contract })))
    (print { action: "fund-claim", user: contract-caller, data: { claim-id: claim-id, shares: shares, assets: assets, share-price: share-price } })
    (ok assets)
  )
)

;; @desc - Optimized batch funding of claims
(define-public (fund-claim-many (claim-ids (list 1000 uint)))
  (let (
    (share-price (contract-call? .state get-share-price))
    (initial-accum { total-shares: u0, total-assets: u0, share-price: share-price })
  )
    (asserts! (> (len claim-ids) u0) ERR_EMPTY_LIST)
    (try! (contract-call? .hq-hbtc check-is-manager contract-caller))
    (match (fold fund-claim-iter claim-ids (ok initial-accum))
      accum
        (begin
          ;; Transfer accumulated assets from reserve to vault in a single batch and update state
          (try! (contract-call? .reserve transfer sbtc-token (get total-assets accum) this-contract))
          (try! (contract-call? .state update-state
            (list
              { type: "total-assets", amount: (get total-assets accum), is-add: false })
            none
            (some { amount: (get total-shares accum), is-add: false, user: this-contract })))
          (print { action: "fund-claim-many", user: contract-caller, data: { total-shares: (get total-shares accum), total-assets: (get total-assets accum) } })
          (ok true)
        )
      error (err error)
    )
  )
)

;; @desc - Iterator function for fund-claim-many that processes each claim and accumulates totals
(define-private (fund-claim-iter (claim-id uint) (prev (response { total-shares: uint, total-assets: uint, share-price: uint } uint)))
  (match prev
    accum
      (let (
        (result (try! (process-claim 
          claim-id 
          (get share-price accum)
          none)))
      )
        (ok {
          total-shares: (+ (get total-shares accum) (get shares result)),
          total-assets: (+ (get total-assets accum) (get assets result)),
          share-price: (get share-price accum)
        })
      )
    error (err error)
  )
)

;; @desc - Processes a single claim for funding (validates, calculates assets/fee, updates claim map)
(define-private (process-claim 
  (claim-id uint) 
  (share-price uint)
  (maybe-manager (optional bool)))
  (let (
    (claim (try! (get-claim claim-id)))
    (shares (get shares claim))
    (is-cooled-down (>= (get-current-ts) (get ts claim)))
    (assets (/ (* shares share-price) share-base))
    (fee (/ (* assets (get fee-bps claim)) bps-base))
  )
    (asserts! (> assets u0) ERR_BELOW_MIN)
    (asserts! (not (get is-funded claim)) ERR_ALREADY_FUNDED)
    (match maybe-manager
      is-manager (asserts! (or is-manager is-cooled-down) ERR_NOT_COOLED_DOWN)
      true
    )

    ;; Update claim with calculated assets and fee, mark as funded
    (map-set claims { claim-id: claim-id } (merge claim { assets: assets, fee: fee, is-funded: true }))
    (print { action: "process-claim", user: contract-caller, data: { claim-id: claim-id, shares: shares, assets: assets, fee: fee, share-price: share-price, manager: maybe-manager } })
    (ok { shares: shares, assets: assets })
  )
)