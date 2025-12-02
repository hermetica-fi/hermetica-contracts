;; @contract HQ
;; @version 1
;; @desc Centralized governance contract for HBTC protocol


;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_NOT_OWNER (err u101001))
(define-constant ERR_NOT_NEXT_OWNER (err u101002))
(define-constant ERR_NOT_ADMIN (err u101003))
(define-constant ERR_NOT_GUARDIAN (err u101004))
(define-constant ERR_NOT_TRADER (err u101005))
(define-constant ERR_NOT_REWARDER (err u101006))
(define-constant ERR_NOT_MANAGER (err u101007))
(define-constant ERR_NOT_FEE_SETTER (err u101008))
(define-constant ERR_NOT_PROTOCOL (err u101009))
(define-constant ERR_PROTOCOL_DISABLED (err u101010))
(define-constant ERR_NOT_STANDARD (err u101011))
(define-constant ERR_BELOW_MIN (err u101012))
(define-constant ERR_ACTIVATION (err u101013))
(define-constant ERR_NO_ENTRY (err u101014))
(define-constant ERR_DUPLICATE (err u101015))

(define-constant min {
  activation-delay: u86400,                                       ;; 1 day in seconds
})

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var activation-delay uint u86400)
(define-data-var protocol-active bool true)

(define-data-var owner principal tx-sender)
(define-data-var next-owner
  {
    address: principal,
    ts: uint
  }
  {
    address: tx-sender,
    ts: (+ (get-current-ts) (get-activation-delay))
  }
)

;;-------------------------------------
;; Maps
;;-------------------------------------

(define-map admins
  {
    address: principal
  }
  {
    active: bool,
    ts: (optional uint)
  }
)

(define-map guardians
  {
    address: principal
  }
  {
    active: bool
  }
)

(define-map keepers
  {
    address: principal
  }
  {
    trader: bool,
    rewarder: bool,
    manager: bool,
    fee-setter: bool
  }
)

(define-map protocol 
  {
    address: principal
  }
  {
    active: bool,
    ts: (optional uint)
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

(define-read-only (get-activation-delay)
  (var-get activation-delay)
)

(define-read-only (get-protocol-active)
  (var-get protocol-active)
)

(define-read-only (get-owner)
  (var-get owner)
)

(define-read-only (get-next-owner)
  (var-get next-owner)
)

(define-read-only (get-admin (address principal))
  (default-to 
    { active: false, ts: none }
    (map-get? admins { address: address })
  )
)

(define-read-only (get-guardian (address principal))
  (get active
    (default-to
      { active: false }
      (map-get? guardians { address: address })
    )
  )
)

(define-read-only (get-keeper (address principal))
  (default-to
    { trader: false, rewarder: false, manager: false, fee-setter: false }
    (map-get? keepers { address: address })
  )
)

(define-read-only (get-protocol (address principal))
  (default-to 
    { active: false, ts: none } 
    (map-get? protocol { address: address })
  )
)

;;-------------------------------------
;; Checks
;;-------------------------------------

(define-read-only (check-activation-delay (ts uint))
  (ok (asserts! (>= (get-current-ts) ts) ERR_ACTIVATION))
)

(define-read-only (check-is-standard (address principal))
  (ok (asserts! (is-standard address) ERR_NOT_STANDARD))
)

(define-read-only (check-is-protocol-active)
  (ok (asserts! (get-protocol-active) ERR_PROTOCOL_DISABLED))
)

(define-read-only (check-is-owner (address principal))
  (ok (asserts! (is-eq address (get-owner)) ERR_NOT_OWNER))
)

(define-read-only (check-is-admin (address principal))
  (ok (asserts! (get active (get-admin address)) ERR_NOT_ADMIN))
)

(define-read-only (check-is-guardian (address principal))
  (ok (asserts! (get-guardian address) ERR_NOT_GUARDIAN))
)

(define-read-only (check-is-trader (address principal))
  (ok (asserts! (get trader (get-keeper address)) ERR_NOT_TRADER))
)

(define-read-only (check-is-rewarder (address principal))
  (ok (asserts! (get rewarder (get-keeper address)) ERR_NOT_REWARDER))
)

(define-read-only (check-is-manager (address principal))
  (ok (asserts! (get manager (get-keeper address)) ERR_NOT_MANAGER))
)

(define-read-only (check-is-fee-setter (address principal))
  (ok (asserts! (get fee-setter (get-keeper address)) ERR_NOT_FEE_SETTER))
)

(define-read-only (check-is-protocol (address principal))
  (ok (asserts! (get active (get-protocol address)) ERR_NOT_PROTOCOL))
)

(define-read-only (check-is-protocol-two (address-1 principal) (address-2 principal))
  (begin
    (try! (check-is-protocol address-1))
    (check-is-protocol address-2)
  )
)

;;-------------------------------------
;; Setters
;;-------------------------------------

(define-public (set-activation-delay (delay uint))
  (begin
    (try! (check-is-owner contract-caller))
    (asserts! (>= delay (get activation-delay min)) ERR_BELOW_MIN)
    (print { action: "set-activation-delay", user: contract-caller, data: { old: (get-activation-delay), new: delay } })
    (ok (var-set activation-delay delay))
  )
)

(define-public (set-protocol-active (active bool))
  (begin
    (try! (check-is-owner contract-caller))
    (print { action: "set-protocol-active", user: contract-caller, data: { old: (get-protocol-active), new: active } })
    (ok (var-set protocol-active active))
  )
)

(define-public (disable-protocol)
  (begin
    (try! (check-is-guardian contract-caller))
    (print { action: "disable-protocol", user: contract-caller, data: { old: (get-protocol-active), new: false } })
    (ok (var-set protocol-active false))
  )
)

(define-public (request-new-owner (address principal))
  (let (
    (activation-ts (+ (get-current-ts) (get-activation-delay)))
    (new-entry { address: address, ts: activation-ts })
  )
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (asserts! (not (is-eq address (get-owner))) ERR_DUPLICATE)
    (print { action: "request-new-owner", user: contract-caller, data: { old: (get-next-owner), new: new-entry } })
    (ok (var-set next-owner new-entry))
  )
)

(define-public (claim-owner)
  (let (
    (entry (get-next-owner))
    (next (get address entry))
    (current (get-owner))
  )
    (asserts! (is-eq next contract-caller) ERR_NOT_NEXT_OWNER)
    (try! (check-activation-delay (get ts entry)))
    (asserts! (not (is-eq current next)) ERR_DUPLICATE)
    (print { action: "claim-owner", user: contract-caller, data: { old: current, new: next } })
    (ok (var-set owner next))
  )
)

(define-public (request-new-admin (address principal))
  (let (
    (activation-ts (+ (get-current-ts) (get-activation-delay)))
    (new-entry { active: false, ts: (some activation-ts) })
  )
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (print { action: "request-new-admin", user: contract-caller, data: { address: address, old: (get-admin address), new: new-entry } })
    (ok (asserts! (map-insert admins { address: address } new-entry) ERR_DUPLICATE))
  )
)

(define-public (remove-admin (address principal))
  (begin
    (try! (check-is-owner contract-caller))
    (print { action: "remove-admin", user: contract-caller, data: { address: address, old: (get-admin address) } })
    (ok (map-delete admins { address: address }))
  )
)

(define-public (claim-admin)
  (let (
    (entry (get-admin contract-caller))
    (ts (unwrap! (get ts entry) ERR_NO_ENTRY))
    (updated-entry (merge entry { active: true }))
  )
    (try! (check-activation-delay ts))
    (print { action: "claim-admin", user: contract-caller, data: { address: contract-caller, old: entry, new: updated-entry } })
    (ok (map-set admins { address: contract-caller } updated-entry))
  )
)

(define-public (set-guardian (address principal) (active bool))
  (begin
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (print { action: "set-guardian", user: contract-caller, data: { address: address, old: (get-guardian address), new: active } })
    (ok (map-set guardians { address: address } { active: active }))
  )
)

(define-public (set-keeper (address principal) (trader bool) (rewarder bool) (manager bool) (fee-setter bool))
  (begin
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (print { action: "set-keeper", user: contract-caller, data: { address: address, old: (get-keeper address), new: { trader: trader, rewarder: rewarder, manager: manager, fee-setter: fee-setter } } })
    (ok (map-set keepers { address: address } { trader: trader, rewarder: rewarder, manager: manager, fee-setter: fee-setter }))
  )
)

(define-public (request-new-protocol (address principal))
  (let (
    (activation-ts (+ (get-current-ts) (get-activation-delay)))
    (new-entry { active: false, ts: (some activation-ts) })
  )
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (print { action: "request-new-protocol", user: contract-caller, data: { address: address, old: (get-protocol address), new: new-entry } })
    (ok (asserts! (map-insert protocol { address: address } new-entry) ERR_DUPLICATE))
  )
)

(define-public (remove-protocol (address principal))
  (begin
    (try! (check-is-owner contract-caller))
    (print { action: "remove-protocol", user: contract-caller, data: { address: address, old: (get-protocol address) } })
    (ok (map-delete protocol { address: address }))
  )
)

(define-public (activate-protocol (address principal))
  (let (
    (entry (get-protocol address))
    (ts (unwrap! (get ts entry) ERR_NO_ENTRY))
    (updated-entry (merge entry { active: true }))
  )
    (try! (check-is-owner contract-caller))
    (try! (check-activation-delay ts))
    (print { action: "activate-protocol", user: contract-caller, data: { address: address, old: entry, new: updated-entry } })
    (ok (map-set protocol { address: address } updated-entry))
  )
)