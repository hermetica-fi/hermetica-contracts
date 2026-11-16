;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Trading
;; @version 2
;; @description Batched and atomic position management across DeFi protocols

(use-trait ft 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.ft-trait.ft-trait)
(use-trait zest-market 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.market-trait-v7.market-trait-v7)
(use-trait hbtc-vault-trait .vault-trait-v1.vault-trait)
(use-trait staking-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-trait-v1.staking-trait)
(use-trait staking-silo-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-silo-trait-v1.staking-silo-trait)
(use-trait minting-auto-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-trait-v1.minting-auto-trait)
(use-trait pyth-storage 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.storage-trait)
(use-trait pyth-decoder 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.decoder-trait)
(use-trait wormhole-core 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-traits-v2.core-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_INVALID_AMOUNT (err u120001))
(define-constant ERR_INVALID_TOKEN (err u120002))
(define-constant ERR_UNEXPECTED_AMOUNT (err u120003))

(define-constant usdh-token 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1)

(define-constant usdcx-token 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx)

(define-public (zest-open
  (market <zest-market>) (staking <staking-trait>)
  (borrow-token <ft>)
  (borrow-amount uint)
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)
    (try! (contract-call? .zest-interface-v2 zest-borrow market borrow-token borrow-amount price-feeds))
    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))
    (print { action: "zest-open", user: contract-caller, data: { market: market, staking: staking, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

(define-public (zest-close
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>)
  (repay-token <ft>)
  (unstake-amount uint))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)
    (let (
      (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo)))
      (repaid (try! (contract-call? .zest-interface-v2 zest-repay market repay-token repay-amount))))

      (print { action: "zest-close", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repaid } } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Add Collateral and Open Position
;;-------------------------------------

(define-public (zest-add-open
  (market <zest-market>) (staking <staking-trait>) (collateral-token <ft>) (borrow-token <ft>)
  (collateral-amount uint) (borrow-amount uint)
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)

    (try! (contract-call? .zest-interface-v2 zest-collateral-add market collateral-token collateral-amount price-feeds))

    (asserts! (is-eq (contract-of borrow-token) usdh-token) ERR_INVALID_TOKEN)
    (try! (contract-call? .zest-interface-v2 zest-borrow market borrow-token borrow-amount price-feeds))
    (try! (contract-call? .hermetica-interface hermetica-stake borrow-amount staking))

    (print { action: "zest-add-open", user: contract-caller, data: { market: market, staking: staking, collateral: { token: collateral-token, amount: collateral-amount }, borrow: { token: borrow-token, amount: borrow-amount } } })
    (ok true)
  )
)

;;-------------------------------------
;; Close Position and Remove Collateral
;;-------------------------------------

(define-public (zest-close-remove
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (hbtc-vault <hbtc-vault-trait>)
  (collateral-token <ft>) (repay-token <ft>)
  (unstake-amount uint) (collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feeds (optional (list 3 (buff 8192)))))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (contract-of repay-token) usdh-token) ERR_INVALID_TOKEN)
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)

    (let (
      (repay-amount (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo)))
      (repaid (try! (contract-call? .zest-interface-v2 zest-repay market repay-token repay-amount))))

      (try! (contract-call? .zest-interface-v2 zest-collateral-remove market collateral-token collateral-amount price-feeds))

      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, hbtc-vault: hbtc-vault, collateral: { token: collateral-token, amount: collateral-amount }, unstake-amount: unstake-amount, repay: { token: repay-token, amount: repaid }, claim-ids: claim-ids } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Open Position - USDCx
;;-------------------------------------

(define-public (zest-open-usdcx
  (market <zest-market>) (staking <staking-trait>) (minting-auto <minting-auto-trait>)
  (usdh-amount uint)
  (price-feeds (optional (list 3 (buff 8192))))
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  }))
  (let ((assets-data (contract-call? .state get-assets-two usdh-token usdcx-token)))
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (and (get active (get token1 assets-data)) (get active (get token2 assets-data))) ERR_INVALID_TOKEN)
    (let (
      (usdh-per-usdcx-unit (/ (get token-base (get token1 assets-data)) (get token-base (get token2 assets-data))))
      (usdcx-amount (/ usdh-amount usdh-per-usdcx-unit))
    )
      (asserts! (> usdcx-amount u0) ERR_INVALID_AMOUNT)
      (asserts! (is-eq (* usdcx-amount usdh-per-usdcx-unit) usdh-amount) ERR_INVALID_AMOUNT)

      (try! (contract-call? .zest-interface-v2 zest-borrow market usdcx-token usdcx-amount price-feeds))
      (try! (contract-call? .hermetica-interface hermetica-mint minting-auto usdcx-token usdcx-amount usdh-amount u0 none none u0 execution-plan))
      (try! (contract-call? .hermetica-interface hermetica-stake usdh-amount staking))

      (print { action: "zest-open-usdcx", user: contract-caller, data: { market: market, staking: staking, minting-auto: minting-auto, borrow: { token: usdcx-token, amount: usdcx-amount }, usdh-amount: usdh-amount } })
      (ok true)
    )
  )
)

;;-------------------------------------
;; Close Position - USDCx
;;-------------------------------------

(define-public (zest-close-usdcx
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (minting-auto <minting-auto-trait>)
  (unstake-amount uint)
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  }))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (let ((repaid (try! (unstake-redeem-repay market staking staking-silo minting-auto unstake-amount execution-plan))))
      (print { action: "zest-close-usdcx", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, minting-auto: minting-auto, unstake-amount: unstake-amount, repaid: repaid } })
      (ok repaid)
    )
  )
)

(define-public (zest-close-remove-usdcx
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (minting-auto <minting-auto-trait>)
  (hbtc-vault <hbtc-vault-trait>) (collateral-token <ft>)
  (unstake-amount uint) (collateral-amount uint)
  (claim-ids (list 1000 uint))
  (price-feeds (optional (list 3 (buff 8192))))
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  }))
  (begin
    (try! (contract-call? .hq-hbtc check-is-trader contract-caller))
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (let ((repaid (try! (unstake-redeem-repay market staking staking-silo minting-auto unstake-amount execution-plan))))
      (try! (contract-call? .zest-interface-v2 zest-collateral-remove market collateral-token collateral-amount price-feeds))

      (if (> (len claim-ids) u0)
        (begin
          (try! (contract-call? .hq-hbtc check-is-protocol (contract-of hbtc-vault)))
          (try! (contract-call? hbtc-vault fund-claim-many claim-ids))
        )
        true)

      (print { action: "zest-close-remove-usdcx", user: contract-caller, data: { market: market, staking: staking, staking-silo: staking-silo, minting-auto: minting-auto, hbtc-vault: hbtc-vault, collateral: { token: collateral-token, amount: collateral-amount }, unstake-amount: unstake-amount, repaid: repaid, claim-ids: claim-ids } })
      (ok repaid)
    )
  )
)

;;-------------------------------------
;; USDCx Helper
;;-------------------------------------

(define-private (unstake-redeem-repay
  (market <zest-market>) (staking <staking-trait>) (staking-silo <staking-silo-trait>) (minting-auto <minting-auto-trait>)
  (unstake-amount uint)
  (execution-plan {
    pyth-storage-contract: <pyth-storage>,
    pyth-decoder-contract: <pyth-decoder>,
    wormhole-core-contract: <wormhole-core>
  }))
  (let ((assets-data (contract-call? .state get-assets-two usdh-token usdcx-token)))
    (asserts! (> unstake-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (and (get active (get token1 assets-data)) (get active (get token2 assets-data))) ERR_INVALID_TOKEN)
    (let (
      (usdh-per-usdcx-unit (/ (get token-base (get token1 assets-data)) (get token-base (get token2 assets-data))))
      (usdh-received (try! (contract-call? .hermetica-interface hermetica-unstake-and-withdraw unstake-amount staking staking-silo)))
      (usdcx-amount (/ usdh-received usdh-per-usdcx-unit))
      (usdh-to-redeem (* usdcx-amount usdh-per-usdcx-unit))
    )
      (asserts! (> usdcx-amount u0) ERR_INVALID_AMOUNT)
      (let ((usdcx-received (try! (contract-call? .hermetica-interface hermetica-redeem minting-auto usdcx-token usdh-to-redeem u0 none none u0 execution-plan))))
        (asserts! (is-eq usdcx-received usdcx-amount) ERR_UNEXPECTED_AMOUNT)
        (contract-call? .zest-interface-v2 zest-repay market usdcx-token usdcx-received)
      )
    )
  )
)
