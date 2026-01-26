;; @contract Zest Interface 
;; @version 1
;; @description Zest v2 interface for lending/borrowing

(use-trait ft 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.ft-trait.ft-trait)
(use-trait zest-market .zest-market-trait-v1.zest-market-trait)
(use-trait zest-vault .zest-vault-trait-v1.zest-vault-trait)

(define-constant ERR_INVALID_AMOUNT (err u111001))

(define-constant reserve .reserve)

;;-------------------------------------
;; Trader - Collateral Management
;;-------------------------------------

;; @desc - Adds collateral to Zest v2 market
(define-public (zest-collateral-add
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) none (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)

    ;; Update Pyth price feed for sBTC before operation
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))

    ;; Transfer tokens from reserve to this interface
    (try! (contract-call? .reserve transfer asset amount current-contract))
    
    ;; Add collateral to Zest market (position owned by this interface contract)
    (let ((total (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount)) 
      (try! (contract-call? market collateral-add asset amount none))
    ))))
      (print { action: "zest-collateral-add", user: contract-caller, data: { market: market, collateral: { token: asset, amount: amount, new-total: total } } })
      (ok total)
    )
  )
)

;; @desc - Removes collateral from Zest v2 market
(define-public (zest-collateral-remove
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) none (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Remove collateral from Zest market and capture remaining amount (tokens sent directly to reserve)
    (let ((remaining (try! (as-contract? () (try! (contract-call? market collateral-remove asset amount (some reserve) none))))))
      (print { action: "zest-collateral-remove", user: contract-caller, data: { market: market, collateral: { token: asset, amount: amount, remaining: remaining } } })
      (ok remaining)
    )
  )
)

;;-------------------------------------
;; Trader - Borrowing
;;-------------------------------------

;; @desc - Borrows assets from Zest v2 market
(define-public (zest-borrow
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) none (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Borrow from Zest market (debt recorded under this interface contract, tokens sent directly to reserve)
    (try! (as-contract? () (try! (contract-call? market borrow asset amount (some reserve) none))))
    
    (print { action: "zest-borrow", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount } } })
    (ok true)
  )
)

;; @desc - Repays borrowed assets to Zest v2 market
(define-public (zest-repay
  (market <zest-market>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) none (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update Pyth price feed for sBTC before operation (DIA handles USDh)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    
    ;; Transfer repayment from reserve to this interface
    (try! (contract-call? .reserve transfer asset amount current-contract))
    
    (let (
      (repaid-amount (try! (as-contract? 
        ((with-ft (contract-of asset) "*" amount) (with-stx amount)) 
        (try! (contract-call? market repay asset amount (some current-contract)))
      )))
      (leftover (if (< repaid-amount amount) (- amount repaid-amount) u0))
    )
      (if (> leftover u0)
        (try! (as-contract? ((with-ft (contract-of asset) "*" leftover) (with-stx leftover)) (try! (contract-call? asset transfer leftover current-contract reserve none))))
        true
      )
      (print { action: "zest-repay", user: contract-caller, data: { market: market, asset: { token: asset, amount: amount, actual-amount: repaid-amount } } })
      (ok repaid-amount)
    )
  )
)

;;-------------------------------------
;; Liquidity Provider - Vault Management
;;-------------------------------------

;; @desc - Deposits assets to Zest v2 vault as liquidity provider
(define-public (zest-deposit
  (vault <zest-vault>)
  (asset <ft>)
  (amount uint)
  (min-shares uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of vault) none (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Transfer asset from reserve to this interface
    (try! (contract-call? .reserve transfer asset amount current-contract))
    
    ;; Deposit to Zest vault (z-tokens minted directly to reserve)
    (let (
      (received (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount)) 
        (try! (contract-call? vault deposit amount min-shares reserve))
      )))
    )
      (print { action: "zest-deposit", user: contract-caller, data: { vault: vault, asset: { token: asset, amount: amount }, shares: { min-shares: min-shares, received: received } } })
      (ok received)
    )
  )
)

;; @desc - Redeems vault shares from Zest v2 vault
(define-public (zest-redeem
  (vault <zest-vault>)
  (shares uint)
  (min-amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of vault) none none none))
    (asserts! (> shares u0) ERR_INVALID_AMOUNT)

    ;; Transfer z-tokens from reserve to this interface
    (try! (contract-call? .reserve transfer vault shares current-contract))

    (let (
      ;; Redeem from Zest vault (burns vault shares (z-tokens), receives underlying tokens)
      (received (try! (as-contract? ((with-ft (contract-of vault) "*" shares))
        (try! (contract-call? vault redeem shares min-amount reserve))
      )))
    )
      (print { action: "zest-redeem", user: contract-caller, data: { vault: vault, shares: shares, collateral: { min-amount: min-amount, received: received } } })
      (ok received)
    )
  )
)

;; @desc - Deposits assets to Zest v2 vault and adds as collateral in one tx (Helper wrapper for trading)
(define-public (zest-supply-collateral-add
  (market <zest-market>) (vault <zest-vault>)
  (asset <ft>)
  (amount uint)
  (min-shares uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) (some (contract-of vault)) (some (contract-of asset)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)

    ;; Update Pyth price feed if provided
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))

    ;; Transfer tokens from reserve to this interface
    (try! (contract-call? .reserve transfer asset amount current-contract))
    
    ;; Supply and add collateral to Zest market
    (let (
      (received-z-tokens (try! (as-contract? ((with-ft (contract-of asset) "*" amount) (with-stx amount)) (try! (contract-call? vault deposit amount min-shares current-contract)))))
      (total-collateral (try! (as-contract? ((with-ft (contract-of vault) "*" received-z-tokens)) (try! (contract-call? market collateral-add vault received-z-tokens none)))))
    )
      (print { action: "zest-supply-collateral-add", user: contract-caller, data: { market: market, collateral: { token: vault, amount: received-z-tokens, new-total: total-collateral }, underlying: { token: asset, amount: amount } } })
      (ok total-collateral)
    )
  )
)

;; @desc - Removes zToken collateral and redeems for underlying in one tx (Helper wrapper for trading)
(define-public (zest-collateral-remove-redeem
  (market <zest-market>) (vault <zest-vault>)
  (amount uint)
  (min-underlying uint)
  (price-feed-1 (optional (buff 8192))) (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of market) (some (contract-of vault)) (some (contract-of vault)) none))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)

    ;; Update Pyth price feed if provided
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))

    ;; Remove collateral from Zest market and redeem from vault
    (let (
      (remaining-collateral (try! (as-contract? () (try! (contract-call? market collateral-remove vault amount (some current-contract) none)))))
      (received-underlying (try! (as-contract? ((with-ft (contract-of vault) "*" amount)) (try! (contract-call? vault redeem amount min-underlying reserve)))))
    )
      (print { action: "zest-collateral-remove-redeem", user: contract-caller, data: { market: market, collateral: { token: vault, amount: amount, remaining: remaining-collateral }, underlying: { received: received-underlying, min-amount: min-underlying } } })
      (ok received-underlying)
    )
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

;; @desc - sweeps any leftover tokens from interface contract to reserve
(define-public (sweep (asset <ft>) (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-is-asset (contract-of asset)))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (as-contract? 
      ((with-ft (contract-of asset) "*" amount) (with-stx amount)) 
      (try! (contract-call? asset transfer amount current-contract reserve none))
    ))
    (print { action: "sweep", user: contract-caller, data: { sender: current-contract, recipient: reserve, asset: { token: asset, amount: amount } } })
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
      (print { action: "write-feed", user: contract-caller, data: { requested-by: current-contract, oracle: 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-oracle-v4 } })
      (ok true)
    )
    ;; do nothing if none
    (ok true)
  )
)