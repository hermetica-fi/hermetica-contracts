;; @contract Vault
;; @version 1
;; @desc User facing vault contract for hBTC protocol

(impl-trait .vault-trait-v1.vault-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_DEPOSIT_CAP_EXCEEDED (err u103001))
(define-constant ERR_INVALID_AMOUNT (err u103002))
(define-constant ERR_BELOW_MIN_AMOUNT (err u103003))
(define-constant ERR_NO_CLAIM_FOR_ID (err u103004))
(define-constant ERR_NOT_COOLED_DOWN (err u103005))
(define-constant ERR_ALREADY_FUNDED (err u103006))
(define-constant ERR_NOT_FUNDED (err u103007))

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
    assets: uint,                                 ;; gross asset amount (includes fee)
    fee: uint,                                    ;; fee amount in asset
    ts: uint,                                     ;; timestamp in s claim after cooldown
    is-funded: bool,                              ;; true if the claim has been funded
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

;; @desc - calculate how many shares (hBTC tokens) you'd get for a given asset amount
(define-read-only (convert-to-shares (assets uint) (is-round-up bool))
  (let ((share-price (contract-call? .state get-share-price)))
    (if is-round-up
      (/ (+ (* assets share-base) (- share-price u1)) share-price)
      (/ (* assets share-base) share-price)
    )
  )
)

;; @desc - calculate how many assets (sBTC) a given number of shares is worth
(define-read-only (convert-to-assets (shares uint))
  (/ (* shares (contract-call? .state get-share-price)) share-base)
)

;; @desc - preview how many shares would be received for depositing a given asset amount
(define-read-only (preview-deposit (assets uint))
  (convert-to-shares assets false)
)

;; @desc - preview how many shares would be required to withdraw a given asset amount
(define-read-only (preview-withdraw (assets uint))
  (convert-to-shares assets true)
)

;; @desc - preview how many assets would be received for redeeming a given number of shares
(define-read-only (preview-redeem (shares uint))
  (convert-to-assets shares)
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
    (state (contract-call? .state get-deposit-state))
    (shares (preview-deposit assets))
  )
    (asserts! (> assets u0) ERR_INVALID_AMOUNT)
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-is-deposit-active))
    (asserts! (<= (+ (get net-assets state) assets) (get deposit-cap state)) ERR_DEPOSIT_CAP_EXCEEDED)
    (asserts! (>= assets (get min-amount state)) ERR_BELOW_MIN_AMOUNT)

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

;; @desc - shared claim creation logic for both withdraw and redeem operations
(define-private (create-claim (assets uint) (shares uint) (exit-fee uint) (cooldown uint))
  (let (
    (new-claim-id (try! (contract-call? .state increment-claim-id)))
    (fee (/ (* assets exit-fee) bps-base))
    (ts (+ (get-current-ts) cooldown))
  )
    (map-set claims { claim-id: new-claim-id } 
      {
        user: contract-caller,
        assets: assets,
        fee: fee,
        ts: ts,
        is-funded: false
      }
    )
    (try! (contract-call? .state update-state 
      (list 
        { type: "pending-claims", amount: assets, is-add: true })
      none
      (some { amount: shares, is-add: false, user: contract-caller })))
    (print { action: "create-claim", user: contract-caller, data: { claim-id: new-claim-id, shares: shares, assets: assets, fee: fee, cooldown: cooldown, ts: ts } })
    (ok new-claim-id)
  )
)

;; @desc - creates a claim to withdraw asset after cooldown period has passed
(define-public (init-withdraw (assets uint) (is-express bool))
  (let (
    (state (contract-call? .state get-withdraw-state contract-caller is-express))
    (shares (preview-withdraw assets))
  )
    (asserts! (> assets u0) ERR_INVALID_AMOUNT)
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-is-withdraw-active))

    (let ((claim-id (try! (create-claim assets shares (get exit-fee state) (get cooldown state)))))
      (print { action: "init-withdraw", user: contract-caller, data: { claim-id: claim-id, assets: assets, shares: shares, is-express: is-express } })
      (ok claim-id)
    )
  )
)

;; @desc - creates a claim to redeem shares for assets after cooldown period has passed
(define-public (init-redeem (shares uint) (is-express bool))
  (let (
    (state (contract-call? .state get-withdraw-state contract-caller is-express))
    (assets (preview-redeem shares))
  )
    (asserts! (> shares u0) ERR_INVALID_AMOUNT)
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-is-withdraw-active))

    (let ((claim-id (try! (create-claim assets shares (get exit-fee state) (get cooldown state)))))
      (print { action: "init-redeem", user: contract-caller, data: { claim-id: claim-id, assets: assets, shares: shares, is-express: is-express } })
      (ok claim-id)
    )
  )
)

;; @desc - executes a claim for each claim-id in the list
(define-public (withdraw-many (entries (list 1000 uint)))
  (begin
    (try! (contract-call? .state check-is-withdraw-active))
    (ok (map withdraw-internal entries))
  )
)

;; @desc - transfers asset to user after cooldown window has passed
(define-public (withdraw (claim-id uint))
  (begin
    (try! (contract-call? .state check-is-withdraw-active))
    (withdraw-internal claim-id)
  )
)

;; @desc - internal function to perform the withdraw operation
(define-private (withdraw-internal (claim-id uint))
  (let (
    (current-claim (try! (get-claim claim-id)))
    (assets (get assets current-claim))
    (fee (get fee current-claim))
    (user (get user current-claim))
    (assets-net (- assets fee))
  )
    (asserts! (>= (get-current-ts) (get ts current-claim)) ERR_NOT_COOLED_DOWN)
    (asserts! (get is-funded current-claim) ERR_NOT_FUNDED)
    (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer assets-net this-contract user none)))
    (if (> fee u0)
      (try! (as-contract (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer fee this-contract fee-collector none)))
      true
    )
    (print { action: "withdraw", user: contract-caller, data: { claim-id: claim-id, assets: assets, fee: fee, user: user, fee-address: fee-collector } })
    (map-delete claims { claim-id: claim-id })
    (ok assets-net)
  )
)

;;-------------------------------------
;; Protocol
;;-------------------------------------

(define-public (fund-claim-many (claim-ids (list 1000 uint)))
  (fold fund-claim-iter claim-ids (ok true))
)

(define-private (fund-claim-iter (claim-id uint) (prev (response bool uint)))
  (match prev
    success (fund-claim claim-id)
    error (err error)
  )
)

;; @desc - called by the protocol to fund a claim 
(define-public (fund-claim (claim-id uint))
  (let (
    (claim (try! (get-claim claim-id)))
    (assets (get assets claim))
    (is-cooled-down (>= (get-current-ts) (get ts claim)))
    (is-manager (get manager (contract-call? .hq-hbtc get-keeper contract-caller)))
  )
    (asserts! (not (get is-funded claim)) ERR_ALREADY_FUNDED)
    (asserts! (or is-manager is-cooled-down) ERR_NOT_COOLED_DOWN)

    (try! (contract-call? .reserve transfer sbtc-token assets this-contract))
    (try! (contract-call? .state update-state 
      (list
        { type: "total-assets", amount: assets, is-add: false }
        { type: "pending-claims", amount: assets, is-add: false })
      none
      none))
    (map-set claims { claim-id: claim-id } (merge claim { is-funded: true }))
    (print { action: "fund-claim", user: contract-caller, is-manager: is-manager, data: { claim-id: claim-id, claim: (try! (get-claim claim-id)) } })
    (ok true)
  )
)