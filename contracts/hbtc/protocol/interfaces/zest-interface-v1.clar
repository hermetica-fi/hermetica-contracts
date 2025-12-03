;; @contract Zest Interface 
;; @version 1
;; @desc Interface for Zest v2 lending protocol integration

(use-trait ft 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.ft-trait.ft-trait)
(use-trait zest-market .zest-market-trait-v1.zest-market-trait)
(use-trait zest-vault .zest-vault-trait-v1.zest-vault-trait)

(define-constant ERR_INVALID_AMOUNT (err u111001))
(define-constant ERR_INSUFFICIENT_BALANCE (err u111002))

(define-constant this-contract (as-contract tx-sender))
(define-constant reserve .reserve)


;;-------------------------------------
;; Trader - Collateral Management
;;-------------------------------------

;; @desc - Adds collateral to Zest v2 market
(define-public (zest-collateral-add
  (market-trait <zest-market>)
  (asset-trait <ft>)
  (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market-trait) none (some (contract-of asset-trait)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Transfer tokens from reserve to this interface
    (try! (contract-call? .reserve transfer asset-trait amount this-contract))
    
    ;; Add collateral to Zest market and capture new total amount
    (let ((total (try! (as-contract (contract-call? market-trait collateral-add asset-trait amount)))))
      (print { action: "zest-collateral-add", user: contract-caller, data: { market: market-trait, asset: asset-trait, amount: amount, total: total } })
      (ok total)
    )
  )
)

;; @desc - Removes collateral from Zest v2 market
(define-public (zest-collateral-remove
  (market-trait <zest-market>)
  (asset-trait <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192)))
  (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market-trait) none (some (contract-of asset-trait)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Remove collateral from Zest market and capture remaining amount and transfer tokens back to reserve
    (let ((remaining (try! (as-contract (contract-call? market-trait collateral-remove asset-trait amount (some this-contract))))))
      (try! (as-contract (contract-call? asset-trait transfer amount this-contract reserve none)))
      (print { action: "zest-collateral-remove", user: contract-caller, data: { market: market-trait, asset: asset-trait, amount: amount, remaining: remaining } })
      (ok remaining)
    )
  )
)

;;-------------------------------------
;; Trader - Borrowing
;;-------------------------------------

;; @desc - Borrows assets from Zest v2 market
(define-public (zest-borrow
  (market-trait <zest-market>)
  (asset-trait <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192)))
  (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market-trait) none (some (contract-of asset-trait)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Borrow from Zest market (debt recorded under this interface contract)
    (try! (as-contract (contract-call? market-trait borrow asset-trait amount (some this-contract))))
    
    ;; Transfer borrowed tokens to reserve
    (try! (as-contract (contract-call? asset-trait transfer amount this-contract reserve none)))
    
    (print { action: "zest-borrow", user: contract-caller, data: { market: market-trait, asset: asset-trait, amount: amount } })
    (ok true)
  )
)

;; @desc - Repays borrowed assets to Zest v2 market
(define-public (zest-repay
  (market-trait <zest-market>)
  (asset-trait <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192)))
  (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market-trait) none (some (contract-of asset-trait)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Transfer repayment from reserve to this interface
    (try! (contract-call? .reserve transfer asset-trait amount this-contract))
    
    (let ((repaid-amount (try! (as-contract (contract-call? market-trait repay asset-trait amount (some this-contract))))))
      (print { action: "zest-repay", user: contract-caller, data: { market: market-trait, asset: asset-trait, amount: amount, repaid-amount: repaid-amount } })
      (ok repaid-amount)
    )
  )
)

;;-------------------------------------
;; Liquidity Provider - Vault Management
;;-------------------------------------

;; @desc - Deposits assets to Zest v2 vault as liquidity provider
(define-public (zest-deposit
  (vault-trait <zest-vault>)
  (asset-trait <ft>)
  (amount uint)
  (min-shares uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of vault-trait) none (some (contract-of asset-trait)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Transfer asset from reserve to this interface
    (try! (contract-call? .reserve transfer asset-trait amount this-contract))
    
    ;; Deposit to Zest vault (z-tokens minted directly to reserve)
    (let (
      (received (try! (as-contract (contract-call? vault-trait deposit amount min-shares reserve))))
    )
      (print { action: "zest-deposit", user: contract-caller, data: { vault: vault-trait, asset: asset-trait, amount: amount, min-shares: min-shares, shares: received } })
      (ok received)
    )
  )
)

;; @desc - Redeems vault shares from Zest v2 vault
(define-public (zest-redeem
  (vault-trait <zest-vault>)
  (shares uint)
  (min-amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of vault-trait) none none none))
    (asserts! (> shares u0) ERR_INVALID_AMOUNT)

    ;; Transfer z-tokens from reserve to this interface
    (try! (contract-call? .reserve transfer vault-trait shares this-contract))

    (let (
      ;; Redeem from Zest vault (burns vault shares (z-tokens), receives underlying tokens)
      (received (try! (as-contract (contract-call? vault-trait redeem shares min-amount reserve))))
    )
      (print { action: "zest-redeem", user: contract-caller, data: { vault: vault-trait, shares: shares, min-amount: min-amount, amount: received } })
      (ok received)
    )
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

;; @desc - sweeps any leftover tokens from interface contract to reserve
(define-public (sweep (asset-trait <ft>) (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-is-asset (contract-of asset-trait)))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= amount (unwrap-panic (contract-call? asset-trait get-balance this-contract))) ERR_INSUFFICIENT_BALANCE)
    (try! (as-contract (contract-call? asset-trait transfer amount this-contract reserve none)))
    (print { action: "sweep", user: contract-caller, data: { asset: asset-trait, amount: amount, sender: this-contract, recipient: reserve } })
    (ok amount)
  )
)

;;-------------------------------------
;; Helper
;;-------------------------------------

(define-private (write-feed (price-feed (optional (buff 8192))))
  (match price-feed bytes 
    (begin
      (try! (contract-call? 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-oracle-v4 verify-and-update-price-feeds
        bytes
        {
          pyth-storage-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-storage-v4,
          pyth-decoder-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-pnau-decoder-v3,
          wormhole-core-contract: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-core-v4,
        }
      ))
      (print { action: "write-feed", user: contract-caller, data: { requested-by: this-contract, oracle: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-oracle-v4 } })
      (ok true)
    )
    ;; do nothing if none
    (ok true)
  )
)