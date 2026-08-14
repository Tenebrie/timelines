import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

/**
 * Drop-in replacement for `@prisma/adapter-pg`, injected via the ESM loader
 * hook. Rhea constructs `new PrismaPg({ connectionString })` exactly once in
 * DatabaseClient.ts and hands it to PrismaClient; here that construction
 * returns a PGlite-backed driver adapter over the desktop data directory
 * instead, so the app talks to an embedded Postgres with zero code changes.
 * PGlite is real Postgres compiled to WASM: enums, arrays, BIGINT and the
 * whole migration history behave identically.
 *
 * PGlite is single-connection, which needs two behaviors a pooled server
 * never needed:
 *
 * 1. Interactive transactions are serialized through a FIFO gate BEFORE
 *    they reach PGlite. Concurrent transactions queued on PGlite's internal
 *    mutex blow through Prisma's maxWait and, if abandoned mid-queue, can
 *    leave an orphaned open transaction that wedges the database.
 *
 * 2. While a transaction is open, queries on the main (non-transactional)
 *    client are routed INTO it. On a pooled server such queries run on a
 *    separate connection; on PGlite they would queue behind the open
 *    transaction — and when the transaction callback itself awaits one
 *    (e.g. makeTouchWorldQuery(worldId) without the tx client), that is a
 *    self-deadlock. Joining the open transaction preserves liveness and is
 *    at least as atomic as the pooled behavior.
 *
 * A watchdog rolls back any transaction abandoned without commit/rollback.
 */
const LEAKED_TRANSACTION_TIMEOUT_MS = 60_000

function serializeTransactions(adapter) {
	let tail = Promise.resolve()
	// Set while a Prisma interactive transaction is open on PGlite:
	// { queryable, finished } — cleared in finish().
	let active = null

	const routeToOpenTransaction = (method) => async (query) => {
		const current = active
		if (current && !current.finished) {
			try {
				return await current.queryable[method](query)
			} catch (error) {
				// The transaction may have closed while this query was in
				// flight; only then is a retry on the main client safe.
				if (current.finished) {
					return adapter[method](query)
				}
				throw error
			}
		}
		return adapter[method](query)
	}

	const wrapped = Object.create(adapter)
	wrapped.queryRaw = routeToOpenTransaction('queryRaw')
	wrapped.executeRaw = routeToOpenTransaction('executeRaw')

	wrapped.startTransaction = (...args) => {
		let release
		const gate = new Promise((resolve) => {
			release = resolve
		})
		const myTurn = tail
		tail = tail.then(() => gate)

		return (async () => {
			await myTurn
			const state = { queryable: null, finished: false }
			const finish = () => {
				state.finished = true
				if (active === state) active = null
				clearTimeout(watchdog)
				release()
			}
			const watchdog = setTimeout(() => {
				if (state.finished) return
				console.warn('[echo-desktop] transaction held for 60s without commit/rollback, forcing rollback')
				const abandoned = state.queryable
				finish()
				if (abandoned) {
					abandoned.rollback().catch(() => undefined)
				}
			}, LEAKED_TRANSACTION_TIMEOUT_MS)

			try {
				const transaction = await adapter.startTransaction(...args)
				state.queryable = transaction
				active = state
				const wrappedTransaction = Object.create(transaction)
				wrappedTransaction.commit = async () => {
					try {
						return await transaction.commit()
					} finally {
						finish()
					}
				}
				wrappedTransaction.rollback = async () => {
					try {
						return await transaction.rollback()
					} finally {
						finish()
					}
				}
				return wrappedTransaction
			} catch (error) {
				finish()
				throw error
			}
		})()
	}
	return wrapped
}

export class PrismaPg {
	constructor(_config) {
		const dataDir = process.env.NEVERKIN_PGDATA
		if (!dataDir) {
			throw new Error(
				'[echo-desktop] NEVERKIN_PGDATA is not set; the launcher must configure it before Rhea starts',
			)
		}
		const factory = new PrismaPGlite(new PGlite(dataDir))
		const wrappedFactory = Object.create(factory)
		wrappedFactory.connect = async () => serializeTransactions(await factory.connect())
		return wrappedFactory
	}
}
