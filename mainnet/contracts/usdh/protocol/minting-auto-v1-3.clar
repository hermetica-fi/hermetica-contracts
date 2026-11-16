;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

;; @contract Minting Auto
;; @version 1.3
;; @description USDh minting and redeeming for whitelisted users, priced with Pyth Lazer

(impl-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-trait-v1.minting-auto-trait)

(use-trait sip-010-trait 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.sip-010-trait.sip-010-trait)
(use-trait pyth-storage-trait 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.storage-trait)
(use-trait pyth-decoder-trait 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.pyth-traits-v2.decoder-trait)
(use-trait wormhole-core-trait 'SP1CGXWEAMG6P6FT04W66NVGJ7PQWMDAC19R7PJ0Y.wormhole-traits-v2.core-trait)

;;-------------------------------------
;; Constants
;;-------------------------------------

(define-constant ERR_TRADING_DISABLED (err u2301))
(define-constant ERR_NOT_SUPPORTED_ASSET (err u2302))
(define-constant ERR_PRICE_FEED_MISMATCH (err u2303))
(define-constant ERR_STALE_DATA (err u2304))
(define-constant ERR_MINT_LIMIT_EXCEEDED (err u2305))
(define-constant ERR_ABOVE_MAX (err u2306))
(define-constant ERR_BELOW_MIN (err u2307))
(define-constant ERR_NOT_WHITELISTED (err u2308))
(define-constant ERR_PRICE_SLIPPAGE_TOO_HIGH (err u2309))
(define-constant ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO (err u2310))
(define-constant ERR_ORACLE_CONF_TOO_LOW (err u2311))
(define-constant ERR_MISSING_PRICE_DATA (err u2313))
(define-constant ERR_UNTRUSTED_LAZER_SIGNER (err u2314))
(define-constant ERR_FUTURE_PRICE (err u2315))
(define-constant ERR_INVALID_PRICE_UPDATE_BASE u23120000)

(define-constant micros-per-second u1000000)
(define-constant max-price-future-skew u60)

(define-constant bps-base (pow u10 u4))
(define-constant usdh-base (pow u10 u8))

(define-constant max-mint-limit (* u1000000 usdh-base))
(define-constant min-mint-limit-reset-window u60)

;;-------------------------------------
;; Variables
;;-------------------------------------

(define-data-var mint-limit uint (* u500000 usdh-base))
(define-data-var current-mint-limit uint (* u500000 usdh-base))
(define-data-var mint-limit-reset-window uint u600)
(define-data-var last-mint-limit-reset uint u0)

(define-map lazer-feed-ids (buff 32) uint)

(define-map lazer-signers (buff 33) uint)

;;-------------------------------------
;; Getters
;;-------------------------------------

(define-read-only (get-mint-limit)
  (var-get mint-limit)
)

(define-read-only (get-current-mint-limit)
  (var-get current-mint-limit)
)

(define-read-only (get-last-mint-limit-reset)
  (var-get last-mint-limit-reset)
)

(define-read-only (get-mint-limit-reset-window)
  (var-get mint-limit-reset-window)
)

(define-read-only (get-lazer-feed-id (price-feed-id (buff 32)))
  (map-get? lazer-feed-ids price-feed-id)
)

(define-read-only (get-lazer-signer-expiry (pubkey (buff 33)))
  (map-get? lazer-signers pubkey)
)

;;-------------------------------------
;; Checks
;;-------------------------------------

(define-private (check-confidence (price uint) (conf uint) (conf-tolerance-bps uint))
  (ok (asserts! (<= conf (/ (* price conf-tolerance-bps) bps-base)) ERR_ORACLE_CONF_TOO_LOW)))

;;-------------------------------------
;; Oracle
;;-------------------------------------

(define-private (pick-lazer-feed
  (feed {
    feed-id: uint,
    price: (optional int),
    exponent: (optional int),
    publisher-count: (optional uint),
    confidence: (optional uint),
    best-bid: (optional int),
    best-ask: (optional int),
    funding-rate: (optional int),
    funding-timestamp: (optional uint),
    funding-rate-interval: (optional uint),
    market-session: (optional uint),
    ema-price: (optional int),
    ema-confidence: (optional uint),
    feed-update-timestamp: (optional uint) })
  (acc { feed-id: uint, found: (optional { price: (optional int), exponent: (optional int), confidence: (optional uint), feed-update-timestamp: (optional uint) }) }))
  (if (and (is-none (get found acc)) (is-eq (get feed-id feed) (get feed-id acc)))
    (merge acc { found: (some { price: (get price feed), exponent: (get exponent feed), confidence: (get confidence feed), feed-update-timestamp: (get feed-update-timestamp feed) }) })
    acc
  )
)

(define-private (verify-lazer-update (update (buff 8192)))
  (let (
    (decoded (try! (match (contract-call? 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.pyth-lazer-oracle verify-price-feeds
        update 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.pyth-lazer-decoder-v1 none)
      verified (ok verified)
      code (err (+ ERR_INVALID_PRICE_UPDATE_BASE code)))))
    (signer (get signer (unwrap! (contract-call? 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.pyth-lazer-decoder-v1 recover-signer update) ERR_UNTRUSTED_LAZER_SIGNER)))
  )
    (asserts! (< stacks-block-time (default-to u0 (map-get? lazer-signers signer))) ERR_UNTRUSTED_LAZER_SIGNER)
    (ok decoded)
  )
)

(define-private (decode-lazer-price (update (buff 8192)) (price-feed-id (buff 32)))
  (let (
    (feed-id (unwrap! (map-get? lazer-feed-ids price-feed-id) ERR_PRICE_FEED_MISMATCH))
    (decoded (try! (verify-lazer-update update)))
    (feed (unwrap! (get found (fold pick-lazer-feed (get price-feeds decoded) { feed-id: feed-id, found: none })) ERR_PRICE_FEED_MISMATCH))
    (conf (unwrap! (get confidence feed) ERR_MISSING_PRICE_DATA))
    (expo (unwrap! (get exponent feed) ERR_MISSING_PRICE_DATA))
    (price (unwrap! (get price feed) ERR_MISSING_PRICE_DATA))
    (publish-time (/ (unwrap! (get feed-update-timestamp feed) ERR_MISSING_PRICE_DATA) micros-per-second))
  )
    (asserts! (<= publish-time (+ stacks-block-time max-price-future-skew)) ERR_FUTURE_PRICE)
    (ok { price: (to-uint price), price-base: (pow u10 (to-uint (* -1 expo))), conf: conf, publish-time: publish-time })
  )
)

;;-------------------------------------
;; Minter
;;-------------------------------------

(define-public (mint
  (minting-asset <sip-010-trait>)
  (amount-usdh-requested uint)
  (price-slippage-tolerance uint)
  (memo (optional (buff 34)))
  (price-feed-bytes (optional (buff 8192)))
  (execution-plan {
    pyth-storage-contract: <pyth-storage-trait>,
    pyth-decoder-contract: <pyth-decoder-trait>,
    wormhole-core-contract: <wormhole-core-trait>
  }))
  (let (
    (minting-asset-contract (contract-of minting-asset))
    (state (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-state-v1 get-state contract-caller minting-asset-contract )))
    (token-base (get token-base state))
    (conf-tolerance-bps (get conf-tolerance-bps state))
    (price-slippage-bps (get price-slippage-bps state))
    (block-timestamp (unwrap-panic (get-stacks-block-info? time (- stacks-block-height (get block-delay state)))))
    (decoded-data
      (match price-feed-bytes value
        (try! (decode-lazer-price value (get price-feed-id state)))
        { price: usdh-base, price-base: usdh-base, conf: u0, publish-time: (+ block-timestamp u1) }
      )
    )
    (decoded-price-base (get price-base decoded-data))
    (decoded-price (get price decoded-data))
    (decoded-price-conf (get conf decoded-data))
    (timestamp (get publish-time decoded-data))
    (slippage-in-price (/ (* decoded-price price-slippage-bps) bps-base))
    (amount-asset-required-before-slippage (/ (* amount-usdh-requested decoded-price-base token-base) decoded-price usdh-base))
    (amount-asset-required (/ (* amount-usdh-requested decoded-price-base token-base) (- decoded-price slippage-in-price) usdh-base))
    (amount-asset-slippage (- amount-asset-required amount-asset-required-before-slippage))
    (fee-amount (/ (* amount-asset-slippage (get mint-fee state)) bps-base))
  )
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-enabled))
    (asserts! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-state-v1 get-mint-enabled) ERR_TRADING_DISABLED)
    (asserts! (get is-minter state) ERR_NOT_WHITELISTED)
    (asserts! (get is-supported-asset state) ERR_NOT_SUPPORTED_ASSET)
    (try! (check-confidence decoded-price decoded-price-conf conf-tolerance-bps))
    (asserts! (> timestamp block-timestamp) ERR_STALE_DATA)
    (asserts! (<= price-slippage-bps price-slippage-tolerance ) ERR_PRICE_SLIPPAGE_TOO_HIGH)
    (asserts! (>= amount-usdh-requested (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-state-v1 get-min-amount-usdh-requested)) ERR_BELOW_MIN)
    (asserts! (> amount-asset-required u0) ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO)
    (asserts! (or (is-some price-feed-bytes) (is-eq (get price-feed-id state) 0x00)) ERR_PRICE_FEED_MISMATCH)

    (if (>= timestamp (+ (get-last-mint-limit-reset) (get-mint-limit-reset-window)))
      (begin
        (var-set current-mint-limit (get-mint-limit))
        (var-set last-mint-limit-reset timestamp)
      )
      true
    )

    (asserts! (<= amount-usdh-requested (get-current-mint-limit)) ERR_MINT_LIMIT_EXCEEDED)

    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1 mint-for-protocol amount-usdh-requested contract-caller))
    (try! (contract-call? minting-asset transfer (- amount-asset-required fee-amount) contract-caller (unwrap-panic (get custody-address state)) memo))

    (if (> fee-amount u0)
      (try! (contract-call? minting-asset transfer fee-amount contract-caller (get fee-address state) none))
      true
    )

    (print { price: decoded-price, price-conf: decoded-price-conf, oracle-timestamp: timestamp, amount-usdh-requested: amount-usdh-requested, amount-asset-required: amount-asset-required, slippage-in-price: slippage-in-price, fee-amount: fee-amount, minting-asset: minting-asset-contract, conf-tolerance-bps: conf-tolerance-bps })
    (ok (var-set current-mint-limit (- (get-current-mint-limit) amount-usdh-requested)))
  )
)

;;-------------------------------------
;; Redeemer
;;-------------------------------------

(define-public (redeem
  (redeeming-asset <sip-010-trait>)
  (amount-usdh-requested uint)
  (price-slippage-tolerance uint)
  (memo (optional (buff 34)))
  (price-feed-bytes (optional (buff 8192)))
  (execution-plan {
    pyth-storage-contract: <pyth-storage-trait>,
    pyth-decoder-contract: <pyth-decoder-trait>,
    wormhole-core-contract: <wormhole-core-trait>
  }))
  (let (
    (redeeming-asset-contract (contract-of redeeming-asset))
    (state (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-auto-state-v1 get-state contract-caller redeeming-asset-contract )))
    (token-base (get token-base state))
    (conf-tolerance-bps (get conf-tolerance-bps state))
    (price-slippage-bps (get price-slippage-bps state))
    (block-timestamp (unwrap-panic (get-stacks-block-info? time (- stacks-block-height (get block-delay state)))))
    (decoded-data
      (match price-feed-bytes value
        (try! (decode-lazer-price value (get price-feed-id state)))
        { price: usdh-base, price-base: usdh-base, conf: u0, publish-time: (+ block-timestamp u1) }
      )
    )
    (decoded-price-base (get price-base decoded-data))
    (decoded-price (get price decoded-data))
    (decoded-price-conf (get conf decoded-data))
    (timestamp (get publish-time decoded-data))
    (slippage-in-price (/ (* decoded-price price-slippage-bps) bps-base))
    (amount-asset-required-before-slippage (/ (* amount-usdh-requested decoded-price-base token-base) decoded-price usdh-base))
    (amount-asset-required (/ (* amount-usdh-requested decoded-price-base token-base) (+ decoded-price slippage-in-price) usdh-base))
    (amount-asset-slippage (- amount-asset-required-before-slippage amount-asset-required))
    (fee-amount (/ (* amount-asset-slippage (get redeem-fee state)) bps-base))
  )
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-enabled))
    (asserts! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-state-v1 get-redeem-enabled) ERR_TRADING_DISABLED)
    (asserts! (get is-redeemer state) ERR_NOT_WHITELISTED)
    (asserts! (get is-supported-asset state) ERR_NOT_SUPPORTED_ASSET)
    (asserts! (or (is-some price-feed-bytes) (is-eq (get price-feed-id state) 0x00)) ERR_PRICE_FEED_MISMATCH)
    (try! (check-confidence decoded-price decoded-price-conf conf-tolerance-bps))
    (asserts! (> timestamp block-timestamp) ERR_STALE_DATA)
    (asserts! (<= price-slippage-bps price-slippage-tolerance ) ERR_PRICE_SLIPPAGE_TOO_HIGH)
    (asserts! (>= amount-usdh-requested (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.minting-state-v1 get-min-amount-usdh-requested)) ERR_BELOW_MIN)
    (asserts! (> amount-asset-required u0) ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO)

    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1 burn-for-protocol amount-usdh-requested contract-caller))
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.redeeming-reserve-v1-2 transfer (- amount-asset-required fee-amount) contract-caller redeeming-asset memo))

    (if (> fee-amount u0)
      (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.redeeming-reserve-v1-2 transfer fee-amount (get fee-address state) redeeming-asset none))
      true
    )

    (print { price: decoded-price, price-conf: decoded-price-conf, oracle-timestamp: timestamp, amount-usdh-requested: amount-usdh-requested, amount-asset-required: amount-asset-required, slippage-in-price: slippage-in-price, fee-amount: fee-amount, redeeming-asset: redeeming-asset-contract, conf-tolerance-bps: conf-tolerance-bps })
    (ok true)
  )
)

;;-------------------------------------
;; Admin
;;-------------------------------------

(define-public (set-mint-limit (new-mint-limit uint))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-protocol contract-caller))
    (asserts! (<= new-mint-limit max-mint-limit) ERR_ABOVE_MAX)
    (print { old-value: (get-mint-limit), new-value: new-mint-limit })
    (ok (var-set mint-limit new-mint-limit)))
)

(define-public (set-lazer-feed-id (price-feed-id (buff 32)) (feed-id uint))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-protocol contract-caller))
    (print { price-feed-id: price-feed-id, old-value: (get-lazer-feed-id price-feed-id), new-value: feed-id })
    (ok (map-set lazer-feed-ids price-feed-id feed-id)))
)

(define-public (set-lazer-signer (pubkey (buff 33)) (expires-at uint))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-protocol contract-caller))
    (print { pubkey: pubkey, old-value: (get-lazer-signer-expiry pubkey), new-value: expires-at })
    (ok (map-set lazer-signers pubkey expires-at)))
)

(define-public (set-mint-limit-reset-window (new-window uint))
  (begin
    (try! (contract-call? 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.hq-v1 check-is-protocol contract-caller))
    (asserts! (>= new-window min-mint-limit-reset-window) ERR_BELOW_MIN)
    (print { old-value: (get-mint-limit-reset-window), new-value: new-window })
    (ok (var-set mint-limit-reset-window new-window)))
)
