;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

(impl-trait .sip-010-trait.sip-010-trait)

;; Defines the hBTC token according to the SIP010 Standard
(define-fungible-token hBTC)

(define-constant ERR_NOT_AUTHORIZED (err u4))
(define-constant token-decimals u8)

;;-------------------------------------
;; Const and vars
;;-------------------------------------

(define-constant token-symbol "hBTC")

(define-data-var token-name (string-ascii 32) "hBTC")
(define-data-var token-uri (string-utf8 256) u"https://ipfs.io/ipfs/bafkreibujsyn7cu4us52nbqkrt2pomypjmofxuv6xxz55sy6yz4y43xyzq")
(define-data-var blacklist-enabled bool true)

;;-------------------------------------
;; SIP-010
;;-------------------------------------

(define-read-only (get-total-supply)
  (ok (ft-get-supply hBTC))
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok token-symbol)
)

(define-read-only (get-decimals)
  (ok token-decimals)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance hBTC account))
)

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri)))
)

(define-read-only (get-blacklist-enabled)
  (var-get blacklist-enabled)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq sender tx-sender) (is-eq sender contract-caller)) ERR_NOT_AUTHORIZED)

    (if (var-get blacklist-enabled)
      (try! (contract-call? .blacklist check-is-not-full-two sender recipient))
      true
    )

    (try! (ft-transfer? hBTC amount sender recipient))
    (match memo val (print val) 0x)
    (print { action: "transfer", data: { sender: sender, recipient: recipient, amount: amount, block-height: stacks-block-height } })
    (ok true)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-token-name (value (string-ascii 32)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (ok (var-set token-name value))
  )
)

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (ok (var-set token-uri value))
  )
)

(define-public (set-blacklist-enabled (enabled bool))
  (begin
    (try! (contract-call? .hq-hbtc check-is-owner contract-caller))
    (print { action: "set-blacklist-enabled", user: contract-caller, data: { old: (get-blacklist-enabled), new: enabled } })
    (ok (var-set blacklist-enabled enabled))
  )
)

;;-------------------------------------
;; Mint / Burn
;;-------------------------------------

(define-public (mint-for-protocol (amount uint) (recipient principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol contract-caller))
    (ft-mint? hBTC amount recipient)
  )
)

(define-public (burn-for-protocol (amount uint) (sender principal))
  (begin
    (try! (contract-call? .hq-hbtc check-is-protocol contract-caller))
    (ft-burn? hBTC amount sender)
  )
)