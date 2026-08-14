/**
 * Wrapper around Rhea's generated Prisma client (imports of it redirect
 * here; the ?nkd-original query loads the real one without looping). Raises
 * the interactive-transaction limits — waiting on the adapter's FIFO gate is
 * normal on single-connection PGlite — and marks interactive callbacks via
 * AsyncLocalStorage for the adapter's bypassed-tx-client guard.
 */
import * as original from '../../rhea-backend/dist/prisma/client/client.js?nkd-original'
import { interactiveTransactionContext } from './adapter-pg-shim.mjs'

export * from '../../rhea-backend/dist/prisma/client/client.js?nkd-original'

// Asserted by the launcher: fails loudly if the redirect stops matching
globalThis.__NEVERKIN_DESKTOP_TX_WRAP__ = true

export class PrismaClient extends original.PrismaClient {
	constructor(options = {}) {
		super({
			transactionOptions: { maxWait: 30_000, timeout: 30_000 },
			...options,
		})
	}

	$transaction(input, options) {
		if (typeof input !== 'function') {
			return super.$transaction(input, options)
		}
		return super.$transaction(
			(transactionClient) => interactiveTransactionContext.run(true, () => input(transactionClient)),
			options,
		)
	}
}
