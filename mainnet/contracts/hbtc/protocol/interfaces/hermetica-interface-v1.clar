;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Hermetica Interface
;; @version 1
;; @description Hermetica interface for USDh

(use-trait ft .sip-010-trait.sip-010-trait)
(use-trait pyth-storage 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.storage-trait)
(use-trait pyth-decoder 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.decoder-trait)
(use-trait wormhole-core 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-traits-v2.core-trait)
(use-trait staking-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-trait-v1.staking-trait)
(use-trait staking-silo-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-trait-v1.staking-silo-trait)
(use-trait minting-auto-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-trait-v1.minting-auto-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u110001))

(define-constant usdh-base u100000000)

(define-constant reserve .reserve)
(define-constant usdh-token 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1)
(define-constant susdh-token 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1)

;;-------------------------------------
;; Trader
;;-------------------------------------

(define-public (hermetica-stake
  (amount uint)
  (staking <staking-trait>))
  (let (
    (ratio (unwrap-panic (contract-call? staking get-usdh-per-susdh)))
    (susdh-amount (/ (* amount usdh-base) ratio))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of staking) none none none))
    (try! (contract-call? .reserve transfer usdh-token amount current-contract))
    (try! (as-contract? ((with-ft usdh-token "*" amount))
      (try! (contract-call? staking stake amount none))
    ))
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1 transfer susdh-amount current-contract reserve none))
    (print { action: "hermetica-stake", user: contract-caller, data: { usdh-amount: amount, susdh-amount: susdh-amount, ratio: ratio, staking: staking } })
    (ok susdh-amount)
  )
)

(define-public (hermetica-unstake
  (amount uint)
  (staking <staking-trait>))
  (let (
    (transfer-result (try! (contract-call? .reserve transfer susdh-token amount current-contract)))
    (claim-id (try! (contract-call? staking unstake amount)))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of staking) none none none))
    (print { action: "hermetica-unstake", user: contract-caller, data: { susdh-amount: amount, claim-id: claim-id, staking: staking } })
    (ok claim-id)
  )
)

(define-public (hermetica-withdraw
  (claim-id uint)
  (staking-silo <staking-silo-trait>))
  (let (
    (amount (get amount (unwrap-panic (contract-call? staking-silo get-claim claim-id))))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of staking-silo) none none none))
    (try! (contract-call? staking-silo withdraw claim-id))
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1 transfer amount current-contract reserve none))
    (print { action: "hermetica-withdraw", user: contract-caller, data: { amount: amount, claim-id: claim-id, staking-silo: staking-silo } })
    (ok amount)
  )
)

(define-public (hermetica-unstake-and-withdraw
  (amount uint)
  (staking <staking-trait>)
  (staking-silo <staking-silo-trait>))
  (let (
    (ratio (unwrap-panic (contract-call? staking get-usdh-per-susdh)))
    (usdh-amount (/ (* amount ratio) usdh-base))
    (transfer-result (try! (contract-call? .reserve transfer susdh-token amount current-contract)))
    (claim-id (try! (contract-call? staking unstake amount)))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of staking) (some (contract-of staking-silo)) none none))
    (try! (contract-call? staking-silo withdraw claim-id))
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1 transfer usdh-amount current-contract reserve none))
    (print { action: "hermetica-unstake-and-withdraw", user: contract-caller, data: { susdh-amount: amount, usdh-received: usdh-amount, ratio: ratio, staking: staking, staking-silo: staking-silo, claim-id: claim-id } })
    (ok usdh-amount)
  )
)

(define-public (hermetica-mint
  (minting-auto <minting-auto-trait>)
  (minting-asset <ft>)
  (amount-asset uint)
  (amount-usdh uint)
  (slippage-tolerance-input uint)
  (memo (optional (buff 34)))
  (price-feed (optional (buff 8192)))
  (max-pyth-fee uint)
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  })
)
  (let (
    (minting-asset-contract (contract-of minting-asset))
    (minting-asset-data (contract-call? .state get-asset minting-asset-contract))
    (max-slippage (get max-slippage minting-asset-data))
    (slippage-tolerance (if (< max-slippage slippage-tolerance-input) max-slippage slippage-tolerance-input))
    (pre-balance (unwrap-panic (contract-call? minting-asset get-balance current-contract)))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of minting-auto) none (some minting-asset-contract) none))
    (try! (contract-call? .reserve transfer minting-asset amount-asset current-contract))
    (try! (as-contract?
      ((with-ft (contract-of minting-asset) "*" amount-asset) (with-stx (+ amount-asset max-pyth-fee)))
      (try! (contract-call? minting-auto mint minting-asset amount-usdh slippage-tolerance memo price-feed execution-plan))
    ))

    (let (
      (post-balance (unwrap-panic (contract-call? minting-asset get-balance current-contract)))
      (leftover (if (> post-balance pre-balance) (- post-balance pre-balance) u0))
    )
      (if (> leftover u0)
        (try! (as-contract?
          ((with-ft minting-asset-contract "*" leftover) (with-stx leftover))
          (try! (contract-call? minting-asset transfer leftover current-contract reserve none))
        ))
        true
      )
      (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1 transfer amount-usdh current-contract reserve none))
      (print { action: "hermetica-mint", user: contract-caller, data: { minting-asset: minting-asset, amount-asset: amount-asset, usdh-received: amount-usdh, leftover: leftover, minting-contract: minting-auto } })
      (ok amount-usdh)
    )
  )
)

(define-public (hermetica-redeem
  (minting-auto <minting-auto-trait>)
  (redeeming-asset <ft>)
  (amount-usdh uint)
  (slippage-tolerance-input uint)
  (memo (optional (buff 34)))
  (price-feed (optional (buff 8192)))
  (max-pyth-fee uint)
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  }))
  (let (
    (redeeming-asset-contract (contract-of redeeming-asset))
    (redeeming-asset-data (contract-call? .state get-asset redeeming-asset-contract))
    (max-slippage (get max-slippage redeeming-asset-data))
    (slippage-tolerance (if (< max-slippage slippage-tolerance-input) max-slippage slippage-tolerance-input))
    (initial-asset-balance (unwrap-panic (contract-call? redeeming-asset get-balance current-contract)))
  )
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-trading-auth (contract-of minting-auto) none (some redeeming-asset-contract) none))
    (try! (contract-call? .reserve transfer usdh-token amount-usdh current-contract))
    (try! (as-contract? ((with-ft usdh-token "*" amount-usdh) (with-stx max-pyth-fee))
      (try! (contract-call? minting-auto redeem redeeming-asset amount-usdh slippage-tolerance memo price-feed execution-plan))
    ))
    (let (
      (new-asset-balance (unwrap-panic (contract-call? redeeming-asset get-balance current-contract)))
      (asset-received (- new-asset-balance initial-asset-balance))
    )
      (try! (as-contract?
        ((with-ft redeeming-asset-contract "*" asset-received) (with-stx asset-received))
        (try! (contract-call? redeeming-asset transfer asset-received current-contract reserve none))
      ))
      (print { action: "hermetica-redeem", user: contract-caller, data: { redeeming-asset: redeeming-asset, amount-usdh: amount-usdh, asset-received: asset-received, minting-contract: minting-auto } })
      (ok asset-received)
    )
  )
)

;;-------------------------------------
;; Sweep
;;-------------------------------------

(define-public (sweep (asset <ft>) (amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (try! (contract-call? .state check-is-asset (contract-of asset)))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (as-contract?
      ((with-ft (contract-of asset) "*" amount) (with-stx amount))
      (try! (contract-call? asset transfer amount current-contract reserve none))
    ))
    (print { action: "sweep", user: contract-caller, data: { asset: asset, amount: amount, sender: current-contract, recipient: reserve } })
    (ok amount)
  )
)