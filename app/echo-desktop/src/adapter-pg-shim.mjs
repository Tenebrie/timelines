import { AsyncLocalStorage } from 'node:async_hooks'

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
 * 2. A main-client query issued from INSIDE a $transaction callback fails
 *    loudly. By contract that is an upstream bug: on a pooled server it
 *    silently escapes the transaction's atomicity, and on PGlite it queues
 *    behind the transaction the callback itself is holding — a
 *    self-deadlock. The prisma-client wrapper marks interactive callbacks
 *    via AsyncLocalStorage so the bug surfaces as an immediate, actionable
 *    error. Main-client queries from OTHER requests are untouched — they
 *    queue on PGlite's internal mutex until the transaction commits, which
 *    is ordinary isolation, not a deadlock.
 *
 * A watchdog rolls back any transaction abandoned without commit/rollback.
 */
export const interactiveTransactionContext = new AsyncLocalStorage()

const LEAKED_TRANSACTION_TIMEOUT_MS = 60_000

function serializeTransactions(adapter) {
	let tail = Promise.resolve()
	let transactionOpen = false

	const guarded = (method) => async (query) => {
		if (transactionOpen && interactiveTransactionContext.getStore()) {
			throw new Error(
				'[echo-desktop] query issued from inside a $transaction callback without the transaction ' +
					'client — this escapes atomicity on the cloud deployment and deadlocks on PGlite. ' +
					'Pass the tx client to the query (upstream bug).',
			)
		}
		return adapter[method](query)
	}

	const wrapped = Object.create(adapter)
	wrapped.queryRaw = guarded('queryRaw')
	wrapped.executeRaw = guarded('executeRaw')

	wrapped.startTransaction = (...args) => {
		let release
		const gate = new Promise((resolve) => {
			release = resolve
		})
		const myTurn = tail
		tail = tail.then(() => gate)

		return (async () => {
			await myTurn
			let transaction = null
			let finished = false
			const finish = () => {
				finished = true
				transactionOpen = false
				clearTimeout(watchdog)
				release()
			}
			const watchdog = setTimeout(() => {
				if (finished) return
				console.warn('[echo-desktop] transaction held for 60s without commit/rollback, forcing rollback')
				finish()
				transaction?.rollback().catch(() => undefined)
			}, LEAKED_TRANSACTION_TIMEOUT_MS)

			try {
				transaction = await adapter.startTransaction(...args)
				transactionOpen = true
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
