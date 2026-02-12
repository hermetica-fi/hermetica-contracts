;; SPDX-License-Identifier: BUSL-1.1
;; Copyright (c) 2026 Hermetica Labs, Inc.

(use-trait token-migration-trait .token-migration-trait.token-migration-trait)

(define-trait interim-token-trait
	(
		(start-migration (<token-migration-trait>) (response bool uint))
		(migrate-balance (principal) (response uint uint))
	)
)