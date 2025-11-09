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

;;-------------------------------------
;; Helper Functions (Common to Both Paths)
;;-------------------------------------

;; @desc - Executes USDh borrow plus stake without guard rails
(define-private (zest-open-internal
  (market-trait <zest-market>) (staking-trait <staking>) 
  (usdh-token-trait <ft>)
  (usdh-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    ;; Borrow USDh from Zest v2 market
    (try! (contract-call? .zest-interface zest-borrow market-trait usdh-token-trait usdh-amount price-feed-1 price-feed-2))
    ;; Stake the borrowed USDh into Hermetica
    (try! (contract-call? .hermetica-interface hermetica-stake usdh-amount staking-trait))
    (ok true)
  )
)

;; @desc - Borrows USDh from Zest v2 market and stakes it in Hermetica
(define-public (zest-open
  (market-trait <zest-market>) (staking-trait <staking>) 
  (usdh-token-trait <ft>)
  (usdh-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> usdh-amount u0) ERR_INVALID_AMOUNT)
    (try! (zest-open-internal market-trait staking-trait usdh-token-trait usdh-amount price-feed-1 price-feed-2))
    (print { action: "zest-open", user: contract-caller, data: { usdh-amount: usdh-amount } })
    (ok true)
  )
)

;; @desc - Executes sUSDh unwind plus USDh repay without guard rails and returns the USDh amount repaid
(define-private (zest-close-internal
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) 
  (usdh-token-trait <ft>)
  (susdh-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (let (
    ;; Unstake sUSDh from Hermetica (instant withdrawal)
    (usdh-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw susdh-amount staking-trait staking-silo-trait))))
    ;; Repay USDh loan to Zest v2 market
    (try! (contract-call? .zest-interface zest-repay market-trait usdh-token-trait usdh-amount price-feed-1 price-feed-2))
    (ok usdh-amount)
  )
)

;; @desc - Unstakes sUSDh from Hermetica and repays USDh to Zest v2 market
(define-public (zest-close
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) 
  (usdh-token-trait <ft>)
  (susdh-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> susdh-amount u0) ERR_INVALID_AMOUNT)
    (let (
      (usdh-amount (try! (zest-close-internal market-trait staking-trait staking-silo-trait usdh-token-trait susdh-amount price-feed-1 price-feed-2))))

      (print { action: "zest-close", user: contract-caller, data: { susdh-amount: susdh-amount, usdh-amount: usdh-amount } })
      (ok true)
    )
  )
)

;;=====================================
;; DIRECT PATH (sBTC as Collateral)
;;=====================================

;;-------------------------------------
;; Open Position - Direct Path
;;-------------------------------------

;; @desc - Opens a leveraged position using direct sBTC collateral
(define-public (zest-add-open
  (market-trait <zest-market>) (staking-trait <staking>) (sbtc-token-trait <ft>) (usdh-token-trait <ft>)
  (sbtc-amount uint) (usdh-amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> sbtc-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> usdh-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Add sBTC directly as collateral
    (try! (contract-call? .zest-interface zest-collateral-add market-trait sbtc-token-trait sbtc-amount))

    ;; Step 2: Borrow USDh and stake it in Hermetica
    (try! (zest-open-internal market-trait staking-trait usdh-token-trait usdh-amount price-feed-1 price-feed-2))

    (print { action: "zest-add-open", user: contract-caller, data: { sbtc-amount: sbtc-amount, usdh-amount: usdh-amount } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position - Direct Path
;;-------------------------------------

;; @desc - Closes a leveraged position using direct sBTC collateral
(define-public (zest-close-remove
  (market-trait <zest-market>) (staking-trait <staking>) (staking-silo-trait <staking-silo>) (hbtc-vault-trait <hbtc-vault>)
  (sbtc-token-trait <ft>) (usdh-token-trait <ft>)
  (susdh-amount uint) (collateral-amount uint)
  (claim-ids (list 100 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> susdh-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake sUSDh and repay USDh loan
    (try! (zest-close-internal market-trait staking-trait staking-silo-trait usdh-token-trait susdh-amount price-feed-1 price-feed-2))

    ;; Step 2: Remove sBTC collateral
    (try! (contract-call? .zest-interface zest-collateral-remove market-trait sbtc-token-trait collateral-amount none none))
    
    ;; Step 3: Optional - Fund claims with sBTC now in reserve
    (if (> (len claim-ids) u0)
      (begin
        (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault-trait)))
        (try! (contract-call? hbtc-vault-trait fund-claim-many claim-ids))
      )
      true)

    (print { action: "zest-close-remove", user: contract-caller, data: { susdh-amount: susdh-amount, collateral-amount: collateral-amount, claim-ids: claim-ids } })
    (ok true)
  )
)

;;=====================================
;; VAULT PATH (sBTC -> z-tokens)
;;=====================================

;;-------------------------------------
;; Open Position - Vault Path
;;-------------------------------------

;; @desc - Opens a leveraged position using vault path
(define-public (zest-deposit-add-open
  (market-trait <zest-market>) (vault-trait <zest-vault>) (staking-trait <staking>)
  (sbtc-token-trait <ft>) (usdh-token-trait <ft>)
  (sbtc-amount uint) (usdh-amount uint) (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> sbtc-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> usdh-amount u0) ERR_INVALID_AMOUNT)
    (let (
      ;; Step 1: Deposit sBTC to vault and get z-tokens
      (z-tokens-received (try! (contract-call? .zest-interface zest-deposit vault-trait sbtc-token-trait sbtc-amount min-shares))))
      
      ;; Step 1b: Add z-tokens as collateral to Zest market
      (try! (contract-call? .zest-interface zest-collateral-add market-trait vault-trait z-tokens-received))

      ;; Step 2: Borrow USDh and stake it in Hermetica
      (try! (zest-open-internal market-trait staking-trait usdh-token-trait usdh-amount price-feed-1 price-feed-2))

      (print { action: "zest-deposit-add-open", user: contract-caller, data: { sbtc-amount: sbtc-amount, usdh-amount: usdh-amount } })
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
  (sbtc-token-trait <ft>) (usdh-token-trait <ft>)
  (susdh-amount uint) (collateral-amount uint) (min-sbtc-amount uint)
  (claim-ids (list 100 uint))
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> susdh-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    ;; Step 1: Unstake sUSDh and repay USDh loan
    (try! (zest-close-internal market-trait staking-trait staking-silo-trait usdh-token-trait susdh-amount price-feed-1 price-feed-2))

    ;; Step 2: Remove z-token collateral
    (try! (contract-call? .zest-interface zest-collateral-remove market-trait vault-trait collateral-amount none none))
    
    ;; Step 3: Redeem sBTC from vault (burn z-tokens, get actual sBTC amount)
    (try! (contract-call? .zest-interface zest-redeem vault-trait sbtc-token-trait collateral-amount min-sbtc-amount))
    
    ;; Step 4: Optional - Fund claims with sBTC now in reserve
    (if (> (len claim-ids) u0)
      (begin
        (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault-trait)))
        (try! (contract-call? hbtc-vault-trait fund-claim-many claim-ids))
      )
      true)

    (print { action: "zest-close-remove-redeem", user: contract-caller, data: { susdh-amount: susdh-amount, collateral-amount: collateral-amount, min-sbtc-amount: min-sbtc-amount, claim-ids: claim-ids } })
    (ok true)
  )
)