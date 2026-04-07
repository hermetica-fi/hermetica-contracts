;; ============================================================================
;; dao-multisig
;; ============================================================================
;; Multisig governance contract for DAO proposal management.
;; Manages signers, approval thresholds, and proposal execution with timelocks.

;; ============================================================================
;; TRAITS
;; ============================================================================

(use-trait proposal-script .dao-traits.proposal-script)

;; ============================================================================
;; CONSTANTS
;; ============================================================================

(define-constant DEPLOYER tx-sender)
(define-constant MAX-SIGNERS u20)
(define-constant TIMELOCK u86400)                   ;; 1 day in seconds
(define-constant IMPL-UPDATE-TIMELOCK u604800)      ;; 7 days in seconds

;; ============================================================================
;; ERRORS
;; ============================================================================

(define-constant ERR-DAO (err u1101))
(define-constant ERR-SIGNER (err u1102))
(define-constant ERR-SANITY-SIGNER (err u1103))
(define-constant ERR-SANITY-PROPOSAL (err u1104))
(define-constant ERR-PROPOSAL-EXPIRED (err u1105))
(define-constant ERR-IMPL-UPDATE-PENDING (err u1106))
(define-constant ERR-IMPL-UPDATE-NOT-READY (err u1107))

;; ============================================================================
;; DATA VARS
;; ============================================================================

(define-data-var threshold uint u0)
(define-data-var signer-count uint u0)
(define-data-var nonce uint u0)
(define-data-var default-expiry-duration uint u2592000)  ;; 30 days in seconds
(define-data-var pending-impl-update 
  (optional { new-impl: principal, scheduled-at: uint }) 
  none)

;; ============================================================================
;; MAPS
;; ============================================================================

(define-map signers principal bool)

(define-map proposals
            uint
            {
              script: principal,
              approvals: (list 20 principal),
              executed: bool,
              created-at: uint,
              urgent: bool,
              expires-at: uint
            })

;; ============================================================================
;; PRIVATE FUNCTIONS
;; ============================================================================

;; -- Authorization -----------------------------------------------------------

(define-private (check-dao-auth)
  (ok (asserts! (is-eq tx-sender .dao-executor) ERR-DAO)))

(define-private (check-signer-auth)
  (ok (asserts! (is-signer contract-caller) ERR-SIGNER)))

;; -- Internal Helpers --------------------------------------------------------

(define-private (set-signer (signer principal))
  (unwrap-panic 
    (if (map-insert signers signer true)
        (ok true)
        (err ERR-SANITY-SIGNER))))

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

;; -- Signer Getters ----------------------------------------------------------

(define-read-only (get-threshold)
  (var-get threshold))

(define-read-only (get-signer-count)
  (var-get signer-count))

(define-read-only (get-nonce)
  (var-get nonce))

(define-read-only (is-signer (addr principal))
  (default-to false (map-get? signers addr)))

;; -- Proposal Getters --------------------------------------------------------

(define-read-only (get-proposal (id uint))
  (map-get? proposals id))

(define-read-only (get-approval-count (id uint))
  (match (map-get? proposals id)
    proposal (some (len (get approvals proposal)))
    none))

(define-read-only (has-approved (signer principal) (id uint))
  (match (map-get? proposals id)
    proposal (is-some (index-of (get approvals proposal) signer))
    false))

;; -- Impl Update Getters -----------------------------------------------------

(define-read-only (get-pending-impl-update)
  (var-get pending-impl-update))

;; ============================================================================
;; PUBLIC FUNCTIONS
;; ============================================================================

;; -- Initialization ----------------------------------------------------------

(define-public (init (signer-list (list 20 principal)) (new-threshold uint))
  (begin
    (asserts! 
      (and
        (is-eq DEPLOYER tx-sender)
        (> new-threshold u0)
        (<= new-threshold (len signer-list))
        (is-eq (var-get threshold) u0))
      ERR-SANITY-SIGNER)
    
    (map set-signer signer-list)
    (var-set threshold new-threshold)
    (var-set signer-count (len signer-list))
    (ok true)))

;; -- Signer Management -------------------------------------------------------

(define-public (add-signer (addr principal))
  (begin
    (try! (check-dao-auth))
    (asserts! (not (is-signer addr)) ERR-SANITY-SIGNER)
    (asserts! (< (var-get signer-count) MAX-SIGNERS) ERR-SANITY-SIGNER)
    (map-set signers addr true)
    (var-set signer-count (+ (var-get signer-count) u1))
    
    (print {
      action: "add-signer",
      user: contract-caller,
      data: {
        signer: addr,
        signers-count: (var-get signer-count),
        threshold: (var-get threshold)
      }
    })
    
    (ok true)))

(define-public (remove-signer (addr principal))
  (let ((count (var-get signer-count))
        (current-threshold (var-get threshold)))
    (try! (check-dao-auth))
    (asserts! (is-signer addr) ERR-SANITY-SIGNER)
    (asserts! (> count u1) ERR-SANITY-SIGNER)
    (asserts! (>= (- count u1) current-threshold) ERR-SANITY-SIGNER)
    (map-delete signers addr)
    (var-set signer-count (- count u1))
    
    (print {
      action: "remove-signer",
      user: contract-caller,
      data: {
        signer: addr,
        signers-count: (- count u1),
        threshold: current-threshold
      }
    })
    
    (ok true)))

(define-public (set-threshold (new-threshold uint))
  (begin
    (try! (check-dao-auth))
    (asserts! (> new-threshold u0) ERR-SANITY-SIGNER)
    (asserts! (<= new-threshold (var-get signer-count)) ERR-SANITY-SIGNER)
    
    (print {
      action: "set-threshold",
      user: contract-caller,
      data: {
        old-threshold: (var-get threshold),
        new-threshold: new-threshold,
        signers-count: (var-get signer-count)
      }
    })
    
    (var-set threshold new-threshold)
    (ok true)))

(define-public (set-default-expiry-duration (duration uint))
  (begin
    (try! (check-dao-auth))
    (asserts! (>= duration TIMELOCK) ERR-SANITY-PROPOSAL)
    
    (print {
      action: "set-default-expiry-duration",
      user: contract-caller,
      data: {
        old-duration: (var-get default-expiry-duration),
        new-duration: duration
      }
    })
    
    (var-set default-expiry-duration duration)
    (ok true)))

;; -- Implementation Update ---------------------------------------------------

;; Step 1: Schedule impl update (requires DAO auth via proposal)
(define-public (schedule-impl-update (new-impl principal))
  (begin
    (try! (check-dao-auth))
    (asserts! (is-none (var-get pending-impl-update)) ERR-IMPL-UPDATE-PENDING)
    (var-set pending-impl-update 
      (some { new-impl: new-impl, scheduled-at: stacks-block-time }))
    
    (print {
      action: "schedule-impl-update",
      user: contract-caller,
      data: {
        new-impl: new-impl,
        scheduled-at: stacks-block-time,
        executable-at: (+ stacks-block-time IMPL-UPDATE-TIMELOCK)
      }
    })
    
    (ok true)))

;; Step 2: Execute after timelock (requires DAO auth via second proposal)
(define-public (execute-impl-update)
  (let ((update (unwrap! (var-get pending-impl-update) ERR-SANITY-PROPOSAL)))
    (try! (check-dao-auth))
    (asserts! (>= stacks-block-time 
                  (+ (get scheduled-at update) IMPL-UPDATE-TIMELOCK))
              ERR-IMPL-UPDATE-NOT-READY)
    (try! (contract-call? .dao-executor set-impl (get new-impl update)))
    (var-set pending-impl-update none)
    
    (print {
      action: "execute-impl-update",
      user: contract-caller,
      data: {
        new-impl: (get new-impl update),
        executed-at: stacks-block-time
      }
    })
    
    (ok true)))

;; Cancel pending impl update (requires DAO auth via proposal)
(define-public (cancel-impl-update)
  (begin
    (try! (check-dao-auth))
    (asserts! (is-some (var-get pending-impl-update)) ERR-SANITY-PROPOSAL)
    
    (print {
      action: "cancel-impl-update",
      user: contract-caller,
      data: {
        cancelled-impl: (get new-impl (unwrap-panic (var-get pending-impl-update)))
      }
    })
    
    (var-set pending-impl-update none)
    (ok true)))

;; -- Proposal Management -----------------------------------------------------

(define-public (propose (script principal) (urgent bool))
  (let ((id (var-get nonce))
        (now stacks-block-time)
        (expiry (+ now (var-get default-expiry-duration))))
    (try! (check-signer-auth))
    
    (map-set proposals
             id
             {
               script: script,
               approvals: (list contract-caller),
               executed: false,
               created-at: now,
               urgent: urgent,
               expires-at: expiry
             })
    (var-set nonce (+ id u1))

    (print {
      action: "propose",
      user: contract-caller,
      data: {
        id: id,
        script: script,
        urgent: urgent,
        created-at: now,
        expires-at: expiry
      }
    })

    (ok id)))

(define-public (approve (id uint))
  (let ((proposal   (unwrap-panic (map-get? proposals id)))
        (approvals  (get approvals proposal))
        (napprovals (unwrap-panic (as-max-len? (append approvals contract-caller) u20))))
    (try! (check-signer-auth))

    ;; Check expiration first (fail-fast)
    (asserts! (< stacks-block-time (get expires-at proposal)) ERR-PROPOSAL-EXPIRED)

    (asserts! (and
        (not (get executed proposal))
        (is-none (index-of approvals contract-caller))) 
      ERR-SANITY-PROPOSAL)
    
    (map-set proposals id (merge proposal { approvals: napprovals }))

    (print {
      action: "approve",
      user: contract-caller,
      data: {
        id: id,
        approval-count: (len napprovals),
        expires-at: (get expires-at proposal)
      }
    })

    (ok true)))

(define-public (execute (id uint) (script <proposal-script>))
  (let ((proposal (unwrap-panic (map-get? proposals id)))
        (created-at (get created-at proposal))
        (expires-at (get expires-at proposal))
        (mature-at (+ created-at TIMELOCK))
        (current-threshold (var-get threshold))
        (approvals (len (get approvals proposal))))
    (try! (check-signer-auth))

    ;; check expiration
    (asserts! (< stacks-block-time expires-at) ERR-PROPOSAL-EXPIRED)

    (asserts! 
      (and
        (not (get executed proposal))
        (is-eq (contract-of script) (get script proposal))
        (>= approvals current-threshold)
        (or
          (>= stacks-block-time mature-at)
          (get urgent proposal)))
      ERR-SANITY-PROPOSAL)

    (map-set proposals id (merge proposal { executed: true }))

    (print {
      action: "execute",
      user: contract-caller,
      data: {
        id: id,
        script: (contract-of script),
        approval-count: approvals,
        threshold: current-threshold,
        urgent: (get urgent proposal),
        created-at: created-at,
        executed-at: stacks-block-time
      }
    })

    (contract-call? .dao-executor execute-proposal script)))
