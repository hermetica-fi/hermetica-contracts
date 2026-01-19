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
(define-constant ERR_ABOVE_MAX (err u101013))
(define-constant ERR_TIMELOCK (err u101014))
(define-constant ERR_NO_ENTRY (err u101015))
(define-constant ERR_DUPLICATE (err u101016))
(define-constant ERR_INVALID_ROLE (err u101017))
(define-constant ERR_PENDING_REQUEST (err u101018))


(define-constant max {
  timelock: u2592000,                                     ;; 30 days in seconds
})

(define-constant min {
  timelock: u86400,                                       ;; 1 day in seconds
})

;; Role constants as 1-byte buffers
(define-constant ADMIN 0x01)
(define-constant GUARDIAN 0x02)
(define-constant TRADER 0x03)
(define-constant REWARDER 0x04)
(define-constant MANAGER 0x05)
(define-constant FEE_SETTER 0x06)
(define-constant PROTOCOL 0x07)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var protocol-active bool true)

(define-data-var timelock uint u86400)
(define-data-var next-timelock
  {
    duration: uint,
    ts: uint
  }
  {
    duration: (get-timelock),
    ts: (+ stacks-block-time (get-timelock))
  }
)

(define-data-var owner principal tx-sender)
(define-data-var next-owner
  {
    address: principal,
    ts: uint
  }
  {
    address: tx-sender,
    ts: (+ stacks-block-time (get-timelock))
  }
)

;;-------------------------------------
;; Maps
;;-------------------------------------

(define-map roles 
  {
    type: (buff 1),
    address: principal
  }
  {
    active: bool
  }
)

(define-map update-requests 
  {
    type: (buff 1), 
    address: principal
  }
  {
    ts: uint,
    is-add: bool
  }
)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-timelock)
  (var-get timelock)
)

(define-read-only (get-next-timelock)
  (var-get next-timelock)
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

(define-read-only (get-role (address principal) (type (buff 1)))
  (default-to 
    { active: false }
    (map-get? roles { type: type, address: address })
  )
)

(define-read-only (get-admin (address principal))
  (get active (get-role address ADMIN))
)

(define-read-only (get-guardian (address principal))
  (get active (get-role address GUARDIAN))
)

(define-read-only (get-trader (address principal))
  (get active (get-role address TRADER))
)

(define-read-only (get-rewarder (address principal))
  (get active (get-role address REWARDER))
)

(define-read-only (get-manager (address principal))
  (get active (get-role address MANAGER))
)

(define-read-only (get-fee-setter (address principal))
  (get active (get-role address FEE_SETTER))
)

(define-read-only (get-protocol (address principal))
  (get active (get-role address PROTOCOL))
)

(define-read-only (get-update-request (type (buff 1)) (address principal))
  (match (map-get? update-requests { type: type, address: address })
    entry (ok entry)
    ERR_NO_ENTRY
  )
)

;;-------------------------------------
;; Checks
;;-------------------------------------

(define-read-only (check-timelock (ts uint))
  (ok (asserts! (>= stacks-block-time ts) ERR_TIMELOCK))
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
  (ok (asserts! (get-admin address) ERR_NOT_ADMIN))
)

(define-read-only (check-is-guardian (address principal))
  (ok (asserts! (get-guardian address) ERR_NOT_GUARDIAN))
)

(define-read-only (check-is-trader (address principal))
  (ok (asserts! (get-trader address) ERR_NOT_TRADER))
)

(define-read-only (check-is-rewarder (address principal))
  (ok (asserts! (get-rewarder address) ERR_NOT_REWARDER))
)

(define-read-only (check-is-manager (address principal))
  (ok (asserts! (get-manager address) ERR_NOT_MANAGER))
)

(define-read-only (check-is-fee-setter (address principal))
  (ok (asserts! (get-fee-setter address) ERR_NOT_FEE_SETTER))
)

(define-read-only (check-is-protocol (address principal))
  (ok (asserts! (get-protocol address) ERR_NOT_PROTOCOL))
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

(define-public (request-new-timelock (duration uint))
  (let (
    (current (get-timelock))
    (next (get-next-timelock))
    (activation-ts (+ stacks-block-time current))
    (new-entry { duration: duration, ts: activation-ts })
  )
    (try! (check-is-owner contract-caller))
    (asserts! (is-eq current (get duration next)) ERR_PENDING_REQUEST)
    (asserts! (not (is-eq duration current)) ERR_DUPLICATE)
    (asserts! (>= duration (get timelock min)) ERR_BELOW_MIN)
    (asserts! (<= duration (get timelock max)) ERR_ABOVE_MAX)
    (print { action: "request-new-timelock", user: contract-caller, data: { old: next, new: new-entry } })
    (ok (var-set next-timelock new-entry))
  )
)

(define-public (cancel-new-timelock)
  (let (
    (entry (get-next-timelock))
    (duration (get duration entry))
    (current (get-timelock))
  )
    (try! (check-is-owner contract-caller))
    (asserts! (not (is-eq duration current)) ERR_DUPLICATE)
    (print { action: "cancel-new-timelock", user: contract-caller, data: { old: current, new: duration } })
    (ok (var-set next-timelock { duration: current, ts: stacks-block-time }))
  )
)

(define-public (confirm-new-timelock)
  (let (
    (entry (get-next-timelock))
    (duration (get duration entry))
    (current (get-timelock))
  )
    (try! (check-timelock (get ts entry)))
    (asserts! (not (is-eq current duration)) ERR_DUPLICATE)
    (print { action: "confirm-new-timelock", user: contract-caller, data: { old: current, new: duration } })
    (ok (var-set timelock duration))
  )
)

(define-public (request-new-owner (address principal))
  (let (
    (current (get-owner))
    (next (get-next-owner))
    (activation-ts (+ stacks-block-time (get-timelock)))
    (new-entry { address: address, ts: activation-ts })
  )
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (asserts! (is-eq current (get address next)) ERR_PENDING_REQUEST)
    (asserts! (not (is-eq address current)) ERR_DUPLICATE)
    (print { action: "request-new-owner", user: contract-caller, data: { old: next, new: new-entry } })
    (ok (var-set next-owner new-entry))
  )
)

(define-public (cancel-new-owner)
  (let (
    (entry (get-next-owner))
    (next (get address entry))
    (current (get-owner))
  )
    (try! (check-is-owner contract-caller))
    (asserts! (not (is-eq current next)) ERR_DUPLICATE)
    (print { action: "cancel-new-owner", user: contract-caller, data: { old: current, new: next } })
    (ok (var-set next-owner { address: current, ts: stacks-block-time }))
  )
)

(define-public (claim-owner)
  (let (
    (entry (get-next-owner))
    (next (get address entry))
    (current (get-owner))
  )
    (asserts! (is-eq next contract-caller) ERR_NOT_NEXT_OWNER)
    (try! (check-timelock (get ts entry)))
    (asserts! (not (is-eq current next)) ERR_DUPLICATE)
    (print { action: "claim-owner", user: contract-caller, data: { old: current, new: next } })
    (ok (var-set owner next))
  )
)

(define-private (request-update (type (buff 1)) (address principal) (is-add bool))
  (let (
    (activation-ts (+ stacks-block-time (get-timelock)))
    (new-entry { ts: activation-ts, is-add: is-add })
    (is-active (get active (get-role address type)))
  )
    (try! (check-is-owner contract-caller))
    (try! (check-is-standard address))
    (asserts! (and (>= type 0x01) (<= type 0x08)) ERR_INVALID_ROLE)
    (if is-add
      (asserts! (not is-active) ERR_DUPLICATE)
      (asserts! is-active ERR_NO_ENTRY))
    (print { action: "request-update", user: contract-caller, data: { type: type, address: address, entry: new-entry } })
    (ok (asserts! (map-insert update-requests { type: type, address: address } new-entry) ERR_DUPLICATE))
  )
)

(define-private (cancel-update (type (buff 1)) (address principal))
  (begin
    (try! (check-is-owner contract-caller))
    (print { action: "cancel-update", user: contract-caller, data: { type: type, address: address } })
    (ok (map-delete update-requests { type: type, address: address }))
  )
)

(define-private (confirm-update (type (buff 1)) (address principal))
  (let (
    (entry (try! (get-update-request type address)))
    (is-add (get is-add entry))
  )
    (try! (check-timelock (get ts entry)))
    (begin
      (if is-add
        (map-set roles { type: type, address: address } { active: true })
        (map-delete roles { type: type, address: address }))
      (print { action: "confirm-update", user: contract-caller, data: { type: type, address: address, is-add: is-add } })
      (ok (map-delete update-requests { type: type, address: address }))
    )
  )
)

;;-------------------------------------
;; Role-Specific Functions
;;-------------------------------------

;; Request role update functions
(define-public (request-admin-update (address principal) (is-add bool))
  (request-update ADMIN address is-add)
)

(define-public (request-guardian-update (address principal) (is-add bool))
  (request-update GUARDIAN address is-add)
)

(define-public (request-trader-update (address principal) (is-add bool))
  (request-update TRADER address is-add)
)

(define-public (request-rewarder-update (address principal) (is-add bool))
  (request-update REWARDER address is-add)
)

(define-public (request-manager-update (address principal) (is-add bool))
  (request-update MANAGER address is-add)
)

(define-public (request-fee-setter-update (address principal) (is-add bool))
  (request-update FEE_SETTER address is-add)
)

(define-public (request-protocol-update (address principal) (is-add bool))
  (request-update PROTOCOL address is-add)
)

;; Cancel role request functions
(define-public (cancel-admin-request (address principal))
  (cancel-update ADMIN address)
)

(define-public (cancel-guardian-request (address principal))
  (cancel-update GUARDIAN address)
)

(define-public (cancel-trader-request (address principal))
  (cancel-update TRADER address)
)

(define-public (cancel-rewarder-request (address principal))
  (cancel-update REWARDER address)
)

(define-public (cancel-manager-request (address principal))
  (cancel-update MANAGER address)
)

(define-public (cancel-fee-setter-request (address principal))
  (cancel-update FEE_SETTER address)
)

(define-public (cancel-protocol-request (address principal))
  (cancel-update PROTOCOL address)
)

;; Confirm role request functions
(define-public (confirm-admin-request (address principal))
  (confirm-update ADMIN address)
)

(define-public (confirm-guardian-request (address principal))
  (confirm-update GUARDIAN address)
)

(define-public (confirm-trader-request (address principal))
  (confirm-update TRADER address)
)

(define-public (confirm-rewarder-request (address principal))
  (confirm-update REWARDER address)
)

(define-public (confirm-manager-request (address principal))
  (confirm-update MANAGER address)
)

(define-public (confirm-fee-setter-request (address principal))
  (confirm-update FEE_SETTER address)
)

(define-public (confirm-protocol-request (address principal))
  (confirm-update PROTOCOL address)
)