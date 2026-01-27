;; @contract Zest Vault Trait v1
;; @version 1.0
;; @desc Trait definition for Zest v2 vault contract

(define-trait zest-vault-trait
  (
    ;; --- sip-10 ---
    (get-name         () (response (string-ascii 32) uint))
    (get-symbol       () (response (string-ascii 32) uint))
    (get-token-uri    () (response (optional (string-utf8 256)) uint))
    (get-decimals     () (response uint uint))
    (get-total-supply () (response uint uint))
    (get-balance      (principal) (response uint uint))

    (transfer         (uint principal principal (optional (buff 34))) (response bool uint))

    ;; --- reads ---
    (get-assets        ()     (response uint uint))
    (convert-to-shares (uint) (response uint uint))
    (convert-to-assets (uint) (response uint uint))

    ;; --- mutate ---
    (deposit  (uint uint principal) (response uint uint))
    (redeem (uint uint principal) (response uint uint))
  )
)