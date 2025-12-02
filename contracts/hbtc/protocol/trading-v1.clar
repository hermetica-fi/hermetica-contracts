;; @contract Trading v1
;; @version 1
;; @description Batched and atomic position management across DeFi protocols

(use-trait ft 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.ft-trait.ft-trait)
(use-trait zest-market .zest-market-trait-v1.zest-market-trait)
(use-trait zest-vault .zest-vault-trait-v1.zest-vault-trait)
(use-trait hbtc-vault .vault-trait-v1.vault-trait)
(use-trait staking .staking-trait.staking-trait)
(use-trait staking-silo .staking-silo-trait.staking-silo-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u120001))
(define-constant ERR_NOT_BORROW_TOKEN (err u120002))

(define-constant usdh-token .usdh-token)

;;-------------------------------------
;; Maps
;;-------------------------------------

(define-map borrow-token 
  { 
    address: principal 
  } 
  { 
    active: bool 
  }
)

;;-------------------------------------
;; Borrow Token Management
;;-------------------------------------

;; @desc - Get the active status of a borrow token
(define-read-only (get-borrow-token (address principal))
  (default-to
    { active: false }
    (map-get? borrow-token { address: address })
  )
)

;; @desc - Check if a borrow token is active
(define-read-only (check-is-borrow-token (address principal))
  (ok (asserts! (get active (get-borrow-token address)) ERR_NOT_BORROW_TOKEN))
)

;; @desc - Set the active status of a borrow token (owner only)
(define-public (set-borrow-token (address principal) (active bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (try! (contract-call? .hq-hbtc check-is-standard address))
    (try! (contract-call? .state check-is-asset address))
    (print { action: "set-borrow-token", user: contract-caller, data: { address: address, old: (get-borrow-token address), new: { active: active } } })
    (ok (map-set borrow-token { address: address } { active: active }))
  )
)

;;-------------------------------------
;; Helper Functions (Common to Both Paths)
;;-------------------------------------

;; @desc - Executes borrow plus stake without guard rails
(define-private (zest-open-internal
  (market-trait <zest-market>) (staking-trait <staking>) 
  (borrow-token-trait <ft>)
  (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    ;; Validate that borrow token is a borrow token
    (try! (check-is-borrow-token (contract-of borrow-token-trait)))
    ;; Borrow asset from Zest v2 market
    (try! (contract-call? .zest-interface zest-borrow market-trait borrow-token-trait borrow-amount price-feed-1 price-feed-2))
    ;; Stake the borrowed asset into Hermetica
    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking-trait))
    (ok true)
  )
)

;; @desc - Borrows asset from Zest v2 market and stakes it in Hermetica
(define-public (zest-open
  (market-trait <zest-market>) (staking-trait <staking>) 
  (borrow-token-trait <ft>)
  (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    (try! (zest-open-internal market-trait staking-trait borrow-token-trait borrow-amount price-feed-1 price-feed-2))
    (print { action: "zest-open", user: contract-caller, data: { borrow: { token: borrow-token-trait, amount: borrow-amount } } })
    (ok true)
  )
)

;; @desc - Executes staked asset unwind plus repay without guard rails and returns the amount repaid
(define-private (zest-close-internal
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) 
  (repay-token-trait <ft>)
  (staked-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (let (
    ;; Unstake asset from Hermetica (instant withdrawal)
    (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw staked-amount staking-trait staking-silo-trait))))
    ;; Validate that repay token is a borrow token
    (try! (check-is-borrow-token (contract-of repay-token-trait)))
    ;; Repay loan to Zest v2 market
    (try! (contract-call? .zest-interface zest-repay market-trait repay-token-trait repay-amount price-feed-1 price-feed-2))
    (ok repay-amount)
  )
)

;; @desc - Unstakes asset from Hermetica and repays loan to Zest v2 market
(define-public (zest-close
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) 
  (repay-token-trait <ft>)
  (staked-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> staked-amount u0) ERR_INVALID_AMOUNT)
    (let (
      (repay-amount (try! (zest-close-internal market-trait staking-trait staking-silo-trait repay-token-trait staked-amount price-feed-1 price-feed-2))))

      (print { action: "zest-close", user: contract-caller, data: { staked-amount: staked-amount, repay: { token: repay-token-trait, amount: repay-amount } } })
      (ok true)
    )
  )
)

;;=====================================
;; DIRECT PATH (Collateral Asset)
;;=====================================

;;-------------------------------------
;; Open Position - Direct Path
;;-------------------------------------

;; @desc - Opens a leveraged position using direct collateral
(define-public (zest-add-open
  (market-trait <zest-market>) (staking-trait <staking>) (collateral-token-trait <ft>) (borrow-token-trait <ft>)
  (collateral-amount uint) (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Add collateral directly
    (try! (contract-call? .zest-interface zest-collateral-add market-trait collateral-token-trait collateral-amount))

    ;; Step 2: Borrow asset and stake it in Hermetica
    (try! (zest-open-internal market-trait staking-trait borrow-token-trait borrow-amount price-feed-1 price-feed-2))

    (print { action: "zest-add-open", user: contract-caller, data: { collateral: { token: collateral-token-trait, amount: collateral-amount }, borrow: { token: borrow-token-trait, amount: borrow-amount } } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position - Direct Path
;;-------------------------------------

;; @desc - Closes a leveraged position using direct collateral
(define-public (zest-close-remove
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) (hbtc-vault-trait <hbtc-vault>)
  (collateral-token-trait <ft>) (repay-token-trait <ft>)
  (staked-amount uint) (collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> staked-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake and repay loan
    (let (
      (repay-amount (try! (zest-close-internal market-trait staking-trait staking-silo-trait repay-token-trait staked-amount price-feed-1 price-feed-2))))

      ;; Step 2: Remove collateral
      (try! (contract-call? .zest-interface zest-collateral-remove market-trait collateral-token-trait collateral-amount none none))

      ;; Step 3: Optional - Fund claims with collateral now in reserve
      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault-trait)))
          (try! (contract-call? hbtc-vault-trait fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove", user: contract-caller, data: { collateral: { token: collateral-token-trait, amount: collateral-amount }, staked-amount: staked-amount, repay: { token: repay-token-trait, amount: repay-amount }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)

;;=====================================
;; VAULT PATH (Collateral -> z-tokens)
;;=====================================

;;-------------------------------------
;; Open Position - Vault Path
;;-------------------------------------

;; @desc - Opens a leveraged position using vault path
(define-public (zest-deposit-add-open
  (market-trait <zest-market>) (vault-trait <zest-vault>) (staking-trait <staking>)
  (collateral-token-trait <ft>) (borrow-token-trait <ft>)
  (collateral-amount uint) (borrow-amount uint) (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    (let (
      ;; Step 1: Deposit collateral to vault and get z-tokens
      (z-tokens-received (try! (contract-call? .zest-interface zest-deposit vault-trait collateral-token-trait collateral-amount min-shares))))
      
      ;; Step 1b: Add z-tokens as collateral to Zest market
      (try! (contract-call? .zest-interface zest-collateral-add market-trait vault-trait z-tokens-received))

      ;; Step 2: Borrow asset and stake it in Hermetica
      (try! (zest-open-internal market-trait staking-trait borrow-token-trait borrow-amount price-feed-1 price-feed-2))

      (print { action: "zest-deposit-add-open", user: contract-caller, data: { collateral: { token: collateral-token-trait, amount: collateral-amount }, borrow: { token: borrow-token-trait, amount: borrow-amount } } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Close Position - Vault Paths
;;-------------------------------------

;; @desc - Closes a leveraged position using vault path
(define-public (zest-close-remove-redeem
  (market-trait <zest-market>) (vault-trait <zest-vault>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) (hbtc-vault-trait <hbtc-vault>)
  (collateral-token-trait <ft>) (repay-token-trait <ft>)
  (staked-amount uint) (collateral-amount uint) (min-collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> staked-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake and repay loan
    (let (
      (repay-amount (try! (zest-close-internal market-trait staking-trait staking-silo-trait repay-token-trait staked-amount price-feed-1 price-feed-2))))

      ;; Step 2: Remove z-token collateral
      (try! (contract-call? .zest-interface zest-collateral-remove market-trait vault-trait collateral-amount none none))

      ;; Step 3: Redeem collateral from vault (burn z-tokens, get actual collateral amount)
      (try! (contract-call? .zest-interface zest-redeem vault-trait collateral-amount min-collateral-amount))

      ;; Step 4: Optional - Fund claims with collateral now in reserve
      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault-trait)))
          (try! (contract-call? hbtc-vault-trait fund-claim-many claim-ids))
        )
        true)

    (print { action: "zest-close-remove-redeem", user: contract-caller, data: { collateral: { amount: collateral-amount, min-amount: min-collateral-amount }, staked-amount: staked-amount, repay: { token: repay-token-trait, amount: repay-amount }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)