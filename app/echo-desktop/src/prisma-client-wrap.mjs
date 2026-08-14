/**
 * Wrapper around Rhea's generated Prisma client (the loader hook redirects
 * imports of dist/prisma/client/client.js here; the ?nkd-original query lets
 * this module load the real one without looping).
 *
 * Prisma's default interactive-transaction limits (maxWait 2s, timeout 5s)
 * assume a connection pool. On single-connection PGlite, transactions take
 * turns through the desktop adapter's FIFO gate, so waiting longer than the
 * defaults is normal under bursts — raise both limits. Upstream options are
 * spread last, so if Rhea ever configures its own transactionOptions, those
 * win.
 */
import * as original from '../../rhea-backend/dist/prisma/client/client.js?nkd-original'

export * from '../../rhea-backend/dist/prisma/client/client.js?nkd-original'

// The launcher asserts this after Rhea boots: if the generated client's path
// ever changes, the redirect silently stops matching and the default 2s/5s
// limits would return — fail loudly instead.
globalThis.__NEVERKIN_DESKTOP_TX_WRAP__ = true

export class PrismaClient extends original.PrismaClient {
	constructor(options = {}) {
		super({
			transactionOptions: { maxWait: 30_000, timeout: 30_000 },
			...options,
		})
	}
}
