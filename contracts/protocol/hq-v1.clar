;; @contract HQ
;; @version 0.1

;;-------------------------------------
;; Constants 
;;-------------------------------------

(define-constant ERR_NOT_OWNER (err u1001))
(define-constant ERR_NOT_ADMIN (err u1002))
(define-constant ERR_NOT_GUARDIAN (err u1003))
(define-constant ERR_CONTRACTS_DISABLED (err u1004))
(define-constant ERR_MINTING_DISABLED (err u1005))
(define-constant ERR_INACTIVE_CONTRACT (err u1006))
(define-constant ERR_NO_ENTRY (err u1007))
(define-constant ERR_ACTIVATION (err u1008))

(define-constant activation-delay u1008) ;; burn-block-height

;;-------------------------------------
;; Variables 
;;-------------------------------------

(define-data-var contracts-enabled bool true)
(define-data-var minting-enabled bool true)

;;-------------------------------------
;; Maps 
;;-------------------------------------

(define-map owners
  { 
    address: principal 
  }
  {
    active: bool,
    block-height: (optional uint)
  }
)

(define-map admins
  { 
    address: principal 
  }
  {
    active: bool,
  }
)

(define-map guardians
  { 
    address: principal 
  }
  {
    active: bool,
  }
)

(define-map minting-contracts 
  { 
    address: principal 
  } 
  { 
    active: bool,
    block-height: (optional uint)
  }
)

(define-map contracts
  { 
    address: principal 
  }
  {
    active: bool,
  }
)

;;-------------------------------------
;; Getters 
;;-------------------------------------

(define-read-only (get-contracts-enabled)
  (var-get contracts-enabled)
)
(define-read-only (get-minting-enabled)
  (var-get minting-enabled)
)

(define-read-only (get-owner (address principal))
  (default-to 
    { active: false, block-height: none }
    (map-get? owners { address: address })
  )
)

(define-read-only (get-admin (address principal))
  (get active 
    (default-to 
      { active: false }
      (map-get? admins { address: address })
    )
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

(define-read-only (get-minting-contract (address principal))
  (default-to 
    { active: false, block-height: none }
    (map-get? minting-contracts { address: address })
  )
)

(define-read-only (get-contract-active (address principal))
  (get active 
    (default-to 
      { active: false }
      (map-get? contracts { address: address })
    )
  )
)

;;-------------------------------------
;; Checks 
;;-------------------------------------

(define-public (check-is-enabled)
  (begin
    (asserts! (var-get contracts-enabled) ERR_CONTRACTS_DISABLED)
    (ok true)
  )
)

(define-public (check-is-owner (contract principal))
  (begin
    (asserts! (get active (get-owner contract)) ERR_NOT_OWNER)
    (ok true)
  )
)

(define-public (check-is-admin (contract principal))
  (begin
    (asserts! (get-admin contract) ERR_NOT_ADMIN)
    (ok true)
  )
)

(define-public (check-is-guardian (contract principal))
  (begin
    (asserts! (get-guardian contract) ERR_NOT_GUARDIAN)
    (ok true)
  )
)

(define-public (check-is-minter (contract principal))
  (begin
    (asserts! (get-minting-enabled) ERR_MINTING_DISABLED)
    (asserts! (get active (get-minting-contract contract)) ERR_INACTIVE_CONTRACT)
    (ok true)
  )
)

(define-public (check-is-protocol (contract principal))
  (begin
    (asserts! (get-contract-active contract) ERR_INACTIVE_CONTRACT)
    (ok true)
  )
)

;;-------------------------------------
;; Set 
;;-------------------------------------

(define-public (set-contracts-enabled (enabled bool))
  (begin
    (try! (check-is-admin tx-sender))
    (var-set contracts-enabled enabled)
    (ok true)
  )
)

(define-public (disable-contracts)
  (begin
    (try! (check-is-guardian tx-sender))
    (var-set contracts-enabled false)
    (ok true)
  )
)

(define-public (set-minting-enabled (enabled bool))
  (begin
    (try! (check-is-owner tx-sender))
    (var-set minting-enabled enabled)
    (ok true)
  )
)

(define-public (disable-minting)
  (begin
    (try! (check-is-guardian tx-sender))
    (var-set minting-enabled false)
    (ok true)
  )
)

(define-public (request-owner-update (address principal))
  (begin
    (try! (check-is-owner tx-sender))
    (map-set owners { address: address } { active: false, block-height: (some burn-block-height) })
    (ok true)
  )
)

(define-public (remove-owner (address principal))
  (begin
    (try! (check-is-owner tx-sender))
    (map-delete owners { address: address })
    (ok true)
  )
)

(define-public (activate-owner (address principal))
  (let (
    (owner-entry (get-owner address))
    (owner-block-height (unwrap! (get block-height owner-entry) ERR_NO_ENTRY))
  )
    (try! (check-is-owner tx-sender))
    (asserts! (>= burn-block-height (+ owner-block-height activation-delay)) ERR_ACTIVATION)
    (map-set owners { address: address } (merge owner-entry { active: true }))
    (ok true)
  )
)

(define-public (set-admin (address principal) (active bool))
  (begin
    (try! (check-is-admin tx-sender))
    (map-set admins { address: address } { active: active })
    (ok true)
  )
)

(define-public (set-guardian (address principal) (active bool))
  (begin
    (try! (check-is-admin tx-sender))
    (map-set guardians { address: address } { active: active })
    (ok true)
  )
)

(define-public (request-minting-contract-update (address principal))
  (begin
    (try! (check-is-owner tx-sender))
    (map-set minting-contracts { address: address } { active: false, block-height: (some burn-block-height) })
    (ok true)
  )
)

(define-public (remove-minting-contract (address principal))
  (begin
    (try! (check-is-owner tx-sender))
    (map-delete minting-contracts { address: address })
    (ok true)
  )
)

(define-public (activate-minting-contract (address principal))
  (let (
    (contract-entry (get-minting-contract address))
    (contract-block-height (unwrap! (get block-height contract-entry) ERR_NO_ENTRY))
  )
    (try! (check-is-owner tx-sender))
    (asserts! (>= burn-block-height (+ contract-block-height activation-delay)) ERR_ACTIVATION)
    (map-set minting-contracts {address: address} (merge contract-entry { active: true}))
    (ok true)
  )
)

(define-public (set-contract-active (address principal) (active bool))
  (begin
    (try! (check-is-admin tx-sender))
    (map-set contracts { address: address } { active: active })
    (ok true)
  )
)

;;-------------------------------------
;; Init 
;;-------------------------------------

(map-set owners { address: tx-sender } { active: true, block-height: (some block-height) })
(map-set admins { address: tx-sender } { active: true })
(map-set guardians { address: tx-sender } { active: true })
(map-set minting-contracts { address: .minting } { active: true, block-height: (some block-height) })
(map-set minting-contracts { address: .minting-otc } { active: true, block-height: (some block-height) })
(map-set minting-contracts { address: .controller } { active: true, block-height: (some block-height) })
(map-set minting-contracts { address: .recover } { active: true, block-height: (some block-height) }) 
(map-set minting-contracts { address: .staking } { active: true, block-height: (some block-height) }) 
(map-set contracts { address: tx-sender } { active: true })
(map-set contracts { address: .hq } { active: true })
(map-set contracts { address: .minting } { active: true })
(map-set contracts { address: .minting-otc } { active: true })
(map-set contracts { address: .controller } { active: true })
(map-set contracts { address: .staking } { active: true })
(map-set contracts { address: .recover } { active: true })