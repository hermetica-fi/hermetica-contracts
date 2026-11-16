;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract USDCx Bridge Helper
;; @version 1.0
;; @description Moves reserve USDCx to Ethereum through Circle xReserve in one owner call

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_BELOW_MIN_WITHDRAWAL (err u10001))
(define-constant ERR_BELOW_MIN_RESERVE (err u10002))
(define-constant ERR_INVALID_ETH_ADDRESS (err u10003))
(define-constant ERR_ACTIVATION (err u10004))
(define-constant ERR_ETH_ADDRESS_MISMATCH (err u10005))

(define-constant activation-delay u1008)

(define-constant ethereum-native-domain u0)

(define-constant recipient-padding 0x000000000000000000000000)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var eth-address (buff 20) 0xddf6954ba51958db59f32369309212aa0735a60e)

(define-data-var next-eth-address
  { address: (buff 20), burn-block-height: uint }
  { address: 0xddf6954ba51958db59f32369309212aa0735a60e, burn-block-height: burn-block-height }
)

(define-data-var min-reserve uint u340282366920938463463374607431768211455)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-eth-address)
  (var-get eth-address)
)

(define-read-only (get-next-eth-address)
  (var-get next-eth-address)
)

(define-read-only (get-min-reserve)
  (var-get min-reserve)
)

(define-read-only (get-recipient)
  (concat recipient-padding (var-get eth-address))
)

;;-------------------------------------
;; Transfer and bridge
;;-------------------------------------

(define-public (transfer-and-bridge (amount uint) (expected-eth-address (buff 20)))
  (let (
    (recipient (get-recipient))
  )
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-enabled))
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-owner contract-caller))
    (asserts! (is-eq expected-eth-address (var-get eth-address)) ERR_ETH_ADDRESS_MISMATCH)
    (asserts! (>= amount (contract-call? 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx-v1 get-min-withdrawal-amount)) ERR_BELOW_MIN_WITHDRAWAL)

    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.redeeming-reserve-v1-2 transfer amount current-contract 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx none))
    (asserts! (>= (unwrap-panic (contract-call? 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx get-balance 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.redeeming-reserve-v1-2)) (var-get min-reserve)) ERR_BELOW_MIN_RESERVE)

    (try! (as-contract? ((with-ft 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx "usdcx-token" amount))
      (try! (contract-call? 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx-v1 burn amount ethereum-native-domain recipient))
    ))

    (print { action: "transfer-and-bridge", caller: contract-caller, data: { amount: amount, recipient: recipient } })
    (ok true)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (request-eth-address-update (address (buff 20)))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-owner contract-caller))
    (asserts! (is-eq (len address) u20) ERR_INVALID_ETH_ADDRESS)
    (asserts! (not (is-eq address 0x0000000000000000000000000000000000000000)) ERR_INVALID_ETH_ADDRESS)
    (print {
      action: "request-eth-address-update",
      caller: contract-caller,
      data: { old-value: (var-get eth-address), new-value: address }
    })
    (ok (var-set next-eth-address { address: address, burn-block-height: burn-block-height }))
  )
)

(define-public (activate-eth-address (expected-address (buff 20)))
  (let (
    (next (var-get next-eth-address))
  )
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-owner contract-caller))
    (asserts! (is-eq expected-address (get address next)) ERR_ETH_ADDRESS_MISMATCH)
    (asserts! (>= burn-block-height (+ (get burn-block-height next) activation-delay)) ERR_ACTIVATION)
    (print {
      action: "activate-eth-address",
      caller: contract-caller,
      data: { old-value: (var-get eth-address), new-value: (get address next) }
    })
    (ok (var-set eth-address (get address next)))
  )
)

(define-public (set-min-reserve (amount uint))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-owner contract-caller))
    (print {
      action: "set-min-reserve",
      caller: contract-caller,
      data: { old-value: (var-get min-reserve), new-value: amount }
    })
    (ok (var-set min-reserve amount))
  )
)
