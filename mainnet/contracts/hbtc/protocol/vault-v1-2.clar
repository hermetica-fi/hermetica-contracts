;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Vault
;; @version 1.2
;; @description User interaction logic

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
(define-constant ERR_NOT_AUTHORIZED (err u103008))
(define-constant ERR_NOT_ALLOWED (err u103009))
(define-constant ERR_SENDER_NOT_CALLER (err u103010))
(define-constant ERR_MAX_FEE (err u103011))

(define-constant share-base u100000000)
(define-constant bps-base u10000)

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
    shares: uint,
    share-price: (optional uint),
    assets: (optional uint),
    fee: (optional uint),
    fee-bps: uint,
    ts: uint,
    is-express: bool
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (preview-deposit (assets uint))
  (contract-call? .state convert-to-shares assets)
)

(define-read-only (preview-redeem (shares uint))
  (contract-call? .state convert-to-assets shares)
)

(define-read-only (get-claim (id uint))
  (ok (unwrap! (map-get? claims { claim-id: id }) ERR_NO_CLAIM_FOR_ID))
)

;;-------------------------------------
;; User
;;-------------------------------------

(define-public (deposit (assets uint) (affiliate (optional (buff 64))))
  (let (
    (state (contract-call? .state get-deposit-state assets))
    (shares (get shares state))
  )
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-is-deposit-enabled))
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

(define-private (create-claim (shares uint) (exit-fee uint) (cooldown uint) (is-express bool))
  (let (
    (new-claim-id (try! (contract-call? .state increment-claim-id)))
    (ts (+ stacks-block-time cooldown))
  )
    (try! (contract-call? .token-hbtc transfer shares contract-caller current-contract none))

    (map-set claims { claim-id: new-claim-id }
      {
        user: contract-caller,
        shares: shares,
        share-price: none,
        assets: none,
        fee: none,
        fee-bps: exit-fee,
        ts: ts,
        is-express: is-express
      }
    )
    (print { action: "create-claim", user: contract-caller, data: { claim-id: new-claim-id, shares: shares, cooldown: cooldown, fee-bps: exit-fee, ts: ts, is-express: is-express } })
    (ok new-claim-id)
  )
)

(define-public (request-redeem (shares uint) (is-express bool))
  (let (
    (state (contract-call? .state get-redeem-state contract-caller is-express))
  )
    (asserts! (>= shares (get min-redeem state)) ERR_BELOW_MIN)
    (try! (contract-call? .blacklist check-is-not-soft contract-caller))
    (try! (contract-call? .state check-request-redeem-auth shares is-express))

    (let ((claim-id (try! (create-claim shares (get exit-fee state) (get cooldown state) is-express))))
      (print { action: "request-redeem", user: contract-caller, data: { claim-id: claim-id, shares: shares, is-express: is-express } })
      (ok claim-id)
    )
  )
)

(define-public (redeem-many (entries (list 1000 uint)))
  (begin
    (try! (contract-call? .state check-is-redeem-enabled))
    (ok (map redeem-internal entries))
  )
)

(define-public (redeem (claim-id uint))
  (begin
    (try! (contract-call? .state check-is-redeem-enabled))
    (redeem-internal claim-id)
  )
)

(define-private (redeem-internal (claim-id uint))
  (let (
    (claim (try! (get-claim claim-id)))
    (assets (unwrap! (get assets claim) ERR_NOT_FUNDED))
    (fee (unwrap-panic (get fee claim)))
    (user (get user claim))
    (assets-net (- assets fee))
  )
    (asserts! (>= stacks-block-time (get ts claim)) ERR_NOT_COOLED_DOWN)
    (try! (contract-call? .blacklist check-is-not-soft user))
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer assets-net current-contract user none))
    (if (> fee u0)
      (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer fee current-contract fee-collector none))
      true
    )
    (print { action: "redeem", user: contract-caller, data: { claim-id: claim-id, assets: assets, fee: fee, user: user, fee-address: fee-collector } })
    (map-delete claims { claim-id: claim-id })
    (ok assets-net)
  )
)

(define-public (redeem-peg-out
  (claim-id uint)
  (btc-recipient { hashbytes: (buff 32), version: (buff 1) })
  (max-fee uint))
  (let (
    (claim (try! (get-claim claim-id)))
    (assets (try! (redeem claim-id)))
  )
    (asserts! (is-eq tx-sender contract-caller) ERR_SENDER_NOT_CALLER)
    (asserts! (is-eq tx-sender (get user claim)) ERR_NOT_AUTHORIZED)
    (asserts! (>= assets max-fee) ERR_MAX_FEE)

    (print { action: "redeem-peg-out", user: contract-caller, data: { claim-id: claim-id, assets: assets, btc-recipient: btc-recipient, max-fee: max-fee } })
    (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal initiate-withdrawal-request (- assets max-fee) btc-recipient max-fee)
  )
)

(define-private (redeem-peg-out-iter (claim-id uint) (prev (response uint uint)))
  (let (
    (accum (try! prev))
    (claim (try! (get-claim claim-id)))
  )
    (asserts! (is-eq tx-sender (get user claim)) ERR_NOT_AUTHORIZED)
    (let ((assets-net (try! (redeem-internal claim-id))))
      (ok (+ accum assets-net))
    )
  )
)

(define-public (redeem-peg-out-many
  (claim-ids (list 1000 uint))
  (btc-recipient { hashbytes: (buff 32), version: (buff 1) })
  (max-fee uint))
  (begin
    (asserts! (> (len claim-ids) u0) ERR_EMPTY_LIST)
    (asserts! (is-eq tx-sender contract-caller) ERR_SENDER_NOT_CALLER)
    (try! (contract-call? .state check-is-redeem-enabled))
    (let (
      (total-assets-net (try! (fold redeem-peg-out-iter claim-ids (ok u0))))
    )
      (asserts! (>= total-assets-net max-fee) ERR_MAX_FEE)
      (print { action: "redeem-peg-out-many", user: contract-caller, data: { claim-ids: claim-ids, total-assets: total-assets-net, btc-recipient: btc-recipient, max-fee: max-fee } })
      (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal initiate-withdrawal-request (- total-assets-net max-fee) btc-recipient max-fee)
    )
  )
)

(define-public (cancel-redeem (claim-id uint))
  (let (
    (claim (try! (get-claim claim-id)))
    (claim-user (get user claim))
    (shares (get shares claim))
  )
    (asserts! (is-eq contract-caller claim-user) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (get assets claim)) ERR_ALREADY_FUNDED)
    (asserts! (not (get is-express claim)) ERR_NOT_ALLOWED)
    (try! (contract-call? .blacklist check-is-not-soft claim-user))

    (try! (contract-call? .token-hbtc transfer shares current-contract claim-user none))
    (map-delete claims { claim-id: claim-id })
    (print { action: "cancel-redeem", user: contract-caller, data: { claim-id: claim-id, shares: shares } })
    (ok shares)
  )
)

;;-------------------------------------
;; Protocol
;;-------------------------------------

(define-public (fund-claim (claim-id uint))
  (let (
    (is-manager (contract-call? .hq-hbtc get-manager contract-caller))
    (share-price (contract-call? .state get-share-price))
    (claim (try! (get-claim claim-id)))
    (result (try! (process-claim claim-id claim share-price (some is-manager))))
    (assets (get assets result))
    (shares (get shares result))
  )
    (try! (contract-call? .reserve transfer sbtc-token assets current-contract))
    (try! (contract-call? .state update-state
      (list
        { type: "total-assets", amount: assets, is-add: false })
      none
      (some { amount: shares, is-add: false, user: current-contract })))
    (print { action: "fund-claim", user: contract-caller, data: { claim-id: claim-id, shares: shares, assets: assets, share-price: share-price } })
    (ok assets)
  )
)

(define-public (fund-claim-many (claim-ids (list 1000 uint)))
  (let (
    (share-price (contract-call? .state get-share-price))
    (initial-accum { total-shares: u0, total-assets: u0, share-price: share-price })
  )
    (asserts! (> (len claim-ids) u0) ERR_EMPTY_LIST)
    (try! (contract-call? .hq-hbtc check-is-manager contract-caller))
    (match (fold fund-claim-iter claim-ids (ok initial-accum))
      accum
        (let ((total-assets-accum (get total-assets accum)))
          (asserts! (> total-assets-accum u0) ERR_EMPTY_LIST)
          (try! (contract-call? .reserve transfer sbtc-token total-assets-accum current-contract))
          (try! (contract-call? .state update-state
            (list
              { type: "total-assets", amount: total-assets-accum, is-add: false })
            none
            (some { amount: (get total-shares accum), is-add: false, user: current-contract })))
          (print { action: "fund-claim-many", user: contract-caller, data: { total-shares: (get total-shares accum), total-assets: total-assets-accum } })
          (ok true)
        )
      error (err error)
    )
  )
)

(define-private (fund-claim-iter (claim-id uint) (prev (response { total-shares: uint, total-assets: uint, share-price: uint } uint)))
  (match prev
    accum
      (match (map-get? claims { claim-id: claim-id }) claim
        (let ( (result (try! (process-claim claim-id claim (get share-price accum) none))))
          (ok {
            total-shares: (+ (get total-shares accum) (get shares result)),
            total-assets: (+ (get total-assets accum) (get assets result)),
            share-price: (get share-price accum)
          }))
        (begin
          (print { action: "claim-not-found", user: contract-caller, data: { claim-id: claim-id } })
          (ok accum)
        )
      )
    error (err error)
  )
)

(define-private (process-claim
  (claim-id uint)
  (claim { user: principal, shares: uint, share-price: (optional uint), assets: (optional uint), fee: (optional uint), fee-bps: uint, ts: uint, is-express: bool })
  (share-price uint)
  (maybe-manager (optional bool)))
  (let (
    (shares (get shares claim))
    (is-cooled-down (>= stacks-block-time (get ts claim)))
    (assets (/ (* shares share-price) share-base))
    (fee (/ (* assets (get fee-bps claim)) bps-base))
  )
    (asserts! (> assets u0) ERR_BELOW_MIN)
    (asserts! (is-none (get assets claim)) ERR_ALREADY_FUNDED)
    (match maybe-manager
      is-manager (asserts! (or is-manager is-cooled-down) ERR_NOT_COOLED_DOWN)
      true
    )

    (map-set claims { claim-id: claim-id } (merge claim { share-price: (some share-price), assets: (some assets), fee: (some fee) }))

    (print { action: "process-claim", user: contract-caller, data: { claim-id: claim-id, shares: shares, assets: assets, fee: fee, share-price: share-price, manager: maybe-manager } })
    (ok { shares: shares, assets: assets })
  )
)
