;; @contract Trading v1
;; @version 1
;; @description Batched and atomic position management across DeFi protocols

(use-trait ft 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.ft-trait.ft-trait)
(use-trait zest-market .zest-market-trait-v1.zest-market-trait)
(use-trait zest-vault .zest-vault-trait-v1.zest-vault-trait)
(use-trait hbtc-vault-trait .vault-trait-v1.vault-trait)
(use-trait staking-trait .staking-trait.staking-trait)
(use-trait staking-silo-trait .staking-silo-trait.staking-silo-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u120001))
(define-constant ERR_INVALID_TOKEN (err u120002))

(define-constant usdh-token .usdh-token)

;;-------------------------------------
;; Helper Functions (Common to Both Paths)
;;-------------------------------------

;; @desc - Executes borrow plus stake without guard rails
(define-private (zest-open-internal
  (market <zest-market>) (staking <staking-trait>) 
  (borrow-token <ft>)
  (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    ;; Validate that borrow token is the canonical borrow token
    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)
    ;; Borrow asset from Zest v2 market
    (try! (contract-call? .zest-interface zest-borrow market borrow-token borrow-amount price-feed-1 price-feed-2))
    ;; Stake the borrowed asset into Hermetica
    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))
    (ok true)
  )
)

;; @desc - Borrows asset from Zest v2 market and stakes it in Hermetica
(define-public (zest-open
  (market <zest-market>) (staking <staking-trait>) 
  (borrow-token <ft>)
  (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    (try! (zest-open-internal market staking borrow-token borrow-amount price-feed-1 price-feed-2))
    (print { action: "zest-open", user: contract-caller, data: { market: market, staking: staking, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

;; @desc - Executes staked asset unwind plus repay without guard rails and returns the amount repaid
(define-private (zest-close-internal
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) 
  (repay-token <ft>)
  (unstake-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (let (
    ;; Unstake asset from Hermetica (instant withdrawal)
    (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo)))
  )
    ;; Validate that repay token is the canonical borrow token
    (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)
    ;; Repay loan to Zest v2 market
    (try! (contract-call? .zest-interface zest-repay market repay-token repay-amount price-feed-1 price-feed-2))
    (ok repay-amount)
  )
)

;; @desc - Unstakes asset from Hermetica and repays loan to Zest v2 market
(define-public (zest-close
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) 
  (repay-token <ft>)
  (unstake-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (let (
      (repay-amount (try! (zest-close-internal market staking staking-silo repay-token unstake-amount price-feed-1 price-feed-2))))

      (print { action: "zest-close", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount } } })
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
  (market <zest-market>) (staking <staking-trait>) (collateral-token <ft>) (borrow-token <ft>)
  (collateral-amount uint) (borrow-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Add collateral directly
    (try! (contract-call? .zest-interface zest-collateral-add market collateral-token collateral-amount price-feed-1 price-feed-2))

    ;; Step 2: Borrow asset and stake it in Hermetica
    (try! (zest-open-internal market staking borrow-token borrow-amount none none))

    (print { action: "zest-add-open", user: contract-caller, data: { market: market, staking: staking, collateral: { token: collateral-token, amount: collateral-amount }, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position - Direct Path
;;-------------------------------------

;; @desc - Closes a leveraged position using direct collateral
(define-public (zest-close-remove
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (hbtc-vault <hbtc-vault-trait>)
  (collateral-token <ft>) (repay-token <ft>)
  (unstake-amount uint) (collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake and repay loan
    (let (
      (repay-amount (try! (zest-close-internal market staking staking-silo repay-token unstake-amount price-feed-1 price-feed-2))))

      ;; Step 2: Remove collateral
      (try! (contract-call? .zest-interface zest-collateral-remove market collateral-token collateral-amount none none))
      
      ;; Step 3: Optional - Fund claims with collateral now in reserve
      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)
  
      (print { action: "zest-close-remove", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, hbtc-vault: hbtc-vault, collateral: { token: collateral-token, amount: collateral-amount }, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount }, claim-ids: claim-ids } })
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
  (market <zest-market>) (vault <zest-vault>) (staking <staking-trait>)
  (collateral-token <ft>) (borrow-token <ft>)
  (collateral-amount uint) (borrow-amount uint) (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    (let (
      ;; Step 1: Deposit collateral to vault and get z-tokens
      (z-tokens-received (try! (contract-call? .zest-interface zest-deposit vault collateral-token collateral-amount min-shares))))
      
      ;; Step 1b: Add z-tokens as collateral to Zest market
      (try! (contract-call? .zest-interface zest-collateral-add market vault z-tokens-received price-feed-1 price-feed-2))

      ;; Step 2: Borrow asset and stake it in Hermetica
      (try! (zest-open-internal market staking borrow-token borrow-amount none none))

      (print { action: "zest-deposit-add-open", user: contract-caller, data: { market: market, vault: vault, staking: staking, collateral: { token: collateral-token, amount: collateral-amount }, borrow: { token: borrow-token, amount: borrow-amount } } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Close Position - Vault Paths
;;-------------------------------------

;; @desc - Closes a leveraged position using vault path
(define-public (zest-close-remove-redeem
  (market <zest-market>) (vault <zest-vault>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (hbtc-vault <hbtc-vault-trait>)
  (repay-token <ft>)
  (unstake-amount uint) (collateral-amount uint) (min-collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake and repay loan
    (let (
      (repay-amount (try! (zest-close-internal market staking staking-silo repay-token unstake-amount price-feed-1 price-feed-2))))

      ;; Step 2: Remove z-token collateral
      (try! (contract-call? .zest-interface zest-collateral-remove market vault collateral-amount none none))

      ;; Step 3: Redeem collateral from vault (burn z-tokens, get actual collateral amount)
      (try! (contract-call? .zest-interface zest-redeem vault collateral-amount min-collateral-amount))

      ;; Step 4: Optional - Fund claims with collateral now in reserve
      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove-redeem", user: contract-caller, data: { market: market, vault: vault, staking: staking, staking-silo: staking-silo, hbtc-vault: hbtc-vault, collateral: { amount: collateral-amount, min-amount: min-collateral-amount }, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repay-amount }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)