;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Controller
;; @version 1
;; @description Reward distribution logic

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_ZERO_ONLY_POSITIVE (err u104001))
(define-constant ERR_INSUFFICIENT_FUNDS (err u104002))
(define-constant ERR_NO_PENDING_TRANSFERS (err u104003))

(define-constant bps-base u10000)
(define-constant pct-base u100)
(define-constant fee-collector .fee-collector)
(define-constant rf .reserve-fund)
(define-constant reserve .reserve)
(define-constant sbtc-token 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;;-------------------------------------
;; Rewarder
;;-------------------------------------

(define-public (log-reward (reward uint) (is-positive bool))
  (let (
    (state (contract-call? .state get-reward-state))
    (fees (get fees state))
    (pending-rf (get pending-rf state))
    (reserve-rate (get reserve-rate state))
    (mgmt-fee (/ (* (get mgmt-fee fees) (get net-assets state)) bps-base pct-base))
    (reward-after-mgmt-fee (if (>= reward mgmt-fee) (- reward mgmt-fee) u0))
    (perf-fee (if is-positive (/ (* (get perf-fee fees) reward-after-mgmt-fee) bps-base) u0))
    (total-fees (+ perf-fee mgmt-fee))
    (is-profit (and is-positive (>= reward total-fees)))
    (req-rf (if is-profit
      u0
      (if is-positive
        (- mgmt-fee reward)
        (+ mgmt-fee reward))))
    (total-rf (+ (get-sbtc-balance rf) pending-rf))
  )
    (try! (contract-call? .state check-is-reward-enabled))
    (try! (contract-call? .hq-hbtc check-is-rewarder contract-caller))
    (try! (contract-call? .state check-max-reward reward))

    (asserts! (or (> reward u0) is-positive) ERR_ZERO_ONLY_POSITIVE)

    (if is-profit
      (try! (handle-profit reward total-rf pending-rf perf-fee mgmt-fee reserve-rate))
      (if (<= req-rf total-rf)
          (try! (handle-loss-covered reward is-positive total-rf pending-rf mgmt-fee))
          (try! (handle-loss-exceeds reward is-positive total-rf pending-rf req-rf u0 mgmt-fee))
        )
    )
    (ok true)
  )
)

(define-public (settle-pending)
  (let (
    (pending (contract-call? .state get-pending))
    (pending-fees (get fees pending))
    (pending-rf (get rf pending))
    (total-reserve (get-sbtc-balance reserve))
    (total-pending (+ pending-fees pending-rf))
  )
    (try! (contract-call? .hq-hbtc check-is-manager contract-caller))

    (asserts! (> total-pending u0) ERR_NO_PENDING_TRANSFERS)
    (asserts! (>= total-reserve total-pending) ERR_INSUFFICIENT_FUNDS)

    (if (> pending-fees u0) (try! (contract-call? .reserve transfer sbtc-token pending-fees fee-collector)) true)
    (if (> pending-rf u0) (try! (contract-call? .reserve transfer sbtc-token pending-rf rf)) true)

    (try! (contract-call? .state update-state 
      (list
        { type: "pending-fees", amount: pending-fees, is-add: false }
        { type: "pending-rf", amount: pending-rf, is-add: false }
        { type: "total-assets", amount: total-pending, is-add: false })
      none
      none))
    (print { action: "settle-pending", user: contract-caller, data: { fees: pending-fees, rf: pending-rf, reserve: { old: total-reserve, new: (- total-reserve total-pending) } } })
    (ok true)
  )
)

;;-------------------------------------
;; Helpers
;;-------------------------------------

(define-private (handle-profit 
  (reward uint)
  (total-rf uint) (pending-rf uint)
  (perf-fee uint) (mgmt-fee uint)
  (reserve-rate uint))
  (let (
    (total-fees (+ perf-fee mgmt-fee))
    (reward-after-fees (- reward total-fees))
    (reward-rf (/ (* reward-after-fees reserve-rate) bps-base))
    (reward-net (- reward-after-fees reward-rf))
  )
    (print {
      action: "log-reward",
      user: contract-caller,
      data: { case: (if (is-eq reward-after-fees u0) "zero" "profit"), reward: { gross: reward, net: reward-net, rf: reward-rf, is-positive: true, is-add: true }, fees: { perf: perf-fee, mgmt: mgmt-fee }, rf: { old: total-rf, new: (+ total-rf reward-rf), required: reward-rf } }
    })

    (ok (try! (contract-call? .state update-state 
      (list
        { type: "pending-fees", amount: total-fees, is-add: true }
        { type: "pending-rf", amount: reward-rf, is-add: true })
      (some { reward: reward, is-add: true })
      none)))
  )
)

(define-private (handle-loss-covered 
  (reward uint) (is-positive bool)
  (total-rf uint) (pending-rf uint)
  (mgmt-fee uint))
  (let (
    (req-rf (if is-positive (- mgmt-fee reward) (+ mgmt-fee reward)))
    (transfer-amount (if (> req-rf pending-rf) (- req-rf pending-rf) u0))
    (pending-rf-decrease (- req-rf transfer-amount))
    (delta (if (> mgmt-fee pending-rf-decrease)
              { asset-delta: (- mgmt-fee pending-rf-decrease), is-add: true}
              { asset-delta: (- pending-rf-decrease mgmt-fee), is-add: false}))
    )
    (print {
      action: "log-reward",
      user: contract-caller,
      data: { case: "loss-covered", reward: { gross: reward, net: (get asset-delta delta), rf: transfer-amount, is-positive: is-positive, is-add: (get is-add delta) }, fees: { perf: u0, mgmt: mgmt-fee }, rf: { old: total-rf, new: (- total-rf req-rf), required: req-rf } }
    })

    (if (> transfer-amount u0)
      (try! (contract-call? .reserve-fund transfer sbtc-token transfer-amount reserve))
      true
    )

    (try! (contract-call? .state update-state 
      (list
        { type: "pending-rf", amount: pending-rf-decrease, is-add: false }
        { type: "pending-fees", amount: mgmt-fee, is-add: true })
      (some { reward: (get asset-delta delta), is-add: (get is-add delta) })
      none))
    (ok true) 
  )
)

(define-private (handle-loss-exceeds 
  (reward uint) (is-positive bool)
  (total-rf uint) (pending-rf uint) (req-rf uint)
  (perf-fee uint) (mgmt-fee uint))
  (let (
    (transfer-amount (- total-rf pending-rf))
    (reward-delta (if is-positive
      { reward: (+ reward transfer-amount), is-add: true }
      (if (>= reward transfer-amount)
        { reward: (- reward transfer-amount), is-add: false }
        { reward: (- transfer-amount reward), is-add: true })))
  )
    (print {
      action: "log-reward",
      user: contract-caller,
      data: { case: "loss-exceeds", reward: { gross: reward, net: (get reward reward-delta), rf: transfer-amount, is-positive: is-positive, is-add: (get is-add reward-delta) }, fees: { perf: u0, mgmt: mgmt-fee }, rf: { old: total-rf, new: u0, required: req-rf } }
    })
    (if (> transfer-amount u0)
      (try! (contract-call? .reserve-fund transfer sbtc-token transfer-amount reserve))
      true
    )

    (ok (try! (contract-call? .state update-state 
      (list
        { type: "pending-fees", amount: mgmt-fee, is-add: true }
        { type: "pending-rf", amount: pending-rf, is-add: false })
      (some { reward: (get reward reward-delta), is-add: (get is-add reward-delta) })
      none)))
  )
)

(define-private (get-sbtc-balance (contract principal))
  (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token get-balance contract))
)