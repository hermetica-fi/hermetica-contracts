;; @contract Granite Interface
;; @version 1
;; @desc Interface for Granite protocol integration

(use-trait ft .sip-010-trait.sip-010-trait)
(use-trait granite-borrower .granite-borrower-trait-v1.granite-borrower-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_ASSET (err u112001))
(define-constant ERR_INVALID_AMOUNT (err u112002))

(define-constant aeusdc-token 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc)
(define-constant reserve .reserve)

;;-------------------------------------
;; Trader
;;-------------------------------------

(define-public (granite-borrow
  (borrower <granite-borrower>)
  (asset <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192)))
  (price-feed-2 (optional (buff 8192)))) 
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of borrower) none (some (contract-of asset)) none))
    (asserts! (is-eq (contract-of asset) aeusdc-token) ERR_INVALID_ASSET)
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    (try! (contract-call? borrower borrow none amount none))
    (try! (contract-call? asset transfer amount current-contract reserve none))
    (print { action: "granite-borrow", user: contract-caller, data: { borrower: borrower, asset: asset, amount: amount } })
    (ok true)
  )
)

(define-public (granite-repay
  (borrower <granite-borrower>)
  (asset <ft>)
  (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of borrower) none (some (contract-of asset)) none))
    (asserts! (is-eq (contract-of asset) aeusdc-token) ERR_INVALID_ASSET)
    (try! (contract-call? .reserve transfer asset amount current-contract))
    (try! (as-contract? ((with-ft (contract-of asset) "*" amount)) (try! (contract-call? borrower repay amount none))))
    (print { action: "granite-repay", user: contract-caller, data: { borrower: borrower, asset: asset, amount: amount } })
    (ok true)
  )
)

(define-public (granite-add-collateral
  (borrower <granite-borrower>)
  (collateral <ft>)
  (amount uint)) 
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of borrower) none (some (contract-of collateral)) none))
    (try! (contract-call? .reserve transfer collateral amount current-contract))
    (try! (as-contract? ((with-ft (contract-of collateral) "*" amount)) (try! (contract-call? borrower add-collateral collateral amount none))))
    (print { action: "granite-add-collateral", user: contract-caller, data: { borrower: borrower, collateral: collateral, amount: amount } })
    (ok true)
  )
)

(define-public (granite-remove-collateral
  (borrower <granite-borrower>)
  (collateral <ft>)
  (amount uint)
  (price-feed-1 (optional (buff 8192)))
  (price-feed-2 (optional (buff 8192))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of borrower) none (some (contract-of collateral)) none))
    (try! (write-feed price-feed-1))
    (try! (write-feed price-feed-2))
    (try! (contract-call? borrower remove-collateral none collateral amount none))
    (try! (contract-call? collateral transfer amount current-contract reserve none))
    (print { action: "granite-remove-collateral", user: contract-caller, data: { borrower: borrower, collateral: collateral, amount: amount } })
    (ok true)
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
    (try! (contract-call? asset transfer amount current-contract reserve none))
    (print { action: "sweep", user: contract-caller, data: { asset: asset, amount: amount, sender: current-contract, recipient: reserve } })
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