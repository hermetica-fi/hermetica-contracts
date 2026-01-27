;; @contract Vault Trait v1
;; @version 1.0

(define-trait vault-trait
  (
    ;; User functions
    (deposit (uint (optional (buff 64))) (response uint uint))
    (request-redeem (uint bool) (response uint uint))
    (redeem (uint) (response uint uint))
    (redeem-many ((list 1000 uint)) (response (list 1000 (response uint uint)) uint))

    ;; Protocol functions
    (fund-claim (uint) (response uint uint))
    (fund-claim-many ((list 1000 uint)) (response bool uint))

    ;; Read-only functions
    (get-claim (uint) (response {
      user: principal,
      shares: uint,
      share-price: (optional uint),
      assets: (optional uint),
      fee: (optional uint),
      fee-bps: uint,
      ts: uint,
      is-express: bool
    } uint))
  )
)