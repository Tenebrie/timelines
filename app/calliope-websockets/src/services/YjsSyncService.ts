import { Logger } from '@src/utils/logger.js'
import { docs, setPersistence } from '@y/websocket-server/utils'
import * as Y from 'yjs'

import { persistenceLeaderService } from './PersistenceLeaderService.js'
import { RedisService } from './RedisService.js'
import { RheaService } from './RheaService.js'
import { htmlToYXml, yXmlToHtml } from './YjsParserService.js'

const attachedDocs = new WeakSet<Y.Doc>()

// Origin marker for updates from Redis (to avoid echo)
const REDIS_ORIGIN = 'redis'

// TTL refresh interval (30 seconds, must be less than Redis TTL of 60 seconds)
const TTL_REFRESH_INTERVAL_MS = 30_000

// Track debounce timers for flushing to Rhea (database persistence)
const rheaPersistenceTimers = new Map<string, NodeJS.Timeout>()
const RHEA_DEBOUNCE_DELAY = 2000

// Store metadata per document
export type DocumentMetadata = {
	userId: string
	worldId: string
	entityId: string
	entityType: 'actor' | 'event' | 'article'
}
const documentMetadata = new Map<string, DocumentMetadata>()

/**
 * Flush document state to Rhea
 */
async function flushDocumentToRhea(
	docName: string,
	doc: Y.Doc,
	metadata: DocumentMetadata,
): Promise<boolean> {
	try {
		const fragment = doc.getXmlFragment('default')
		const html = yXmlToHtml(fragment)

		await RheaService.flushDocumentState({
			userId: metadata.userId,
			worldId: metadata.worldId,
			entityId: metadata.entityId,
			entityType: metadata.entityType,
			contentRich: html,
			contentDeltas: Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64'),
		})

		Logger.yjsInfo(docName, `Flushed to Rhea`)
		return true
	} catch (error) {
		Logger.yjsError(docName, `Failed to flush to Rhea:`, error)
		return false
	}
}

/**
 * Schedule a debounced save to Rhea.
 */
function scheduleRheaPersistence(docName: string, doc: Y.Doc, metadata: DocumentMetadata) {
	const existingTimer = rheaPersistenceTimers.get(docName)
	if (existingTimer) {
		clearTimeout(existingTimer)
	}

	const timer = setTimeout(async () => {
		rheaPersistenceTimers.delete(docName)

		const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
		if (isLeader) {
			await flushDocumentToRhea(docName, doc, metadata)
		}
	}, RHEA_DEBOUNCE_DELAY)

	rheaPersistenceTimers.set(docName, timer)
}

export const YjsSyncService = {
	/**
	 * Set up a document for collaboration.
	 * - Loads existing state from Redis (all stored updates)
	 * - Listens for updates and stores them in Redis
	 */
	async setupDocumentListener({
		userId,
		worldId,
		entityId,
		entityType,
		docName,
	}: {
		userId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
		docName: string
	}) {
		const doc = docs.get(docName)
		if (!doc) {
			Logger.yjsWarn(docName, `Document not found`)
			return
		}

		if (attachedDocs.has(doc)) {
			return
		}
		attachedDocs.add(doc)

		const metadata = { userId, worldId, entityId, entityType }
		documentMetadata.set(docName, metadata)

		// Load existing state: first try Redis, then fall back to database
		// Use a lock to prevent race conditions when multiple instances start at the same time
		Logger.yjsInfo(docName, `Loading state...`)

		const MAX_RETRIES = 20
		const RETRY_DELAY_MS = 25

		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			const existingUpdates = await RedisService.getDocumentUpdates(docName)

			if (existingUpdates.length > 0) {
				// Redis has updates - apply them
				Logger.yjsInfo(docName, `Applying ${existingUpdates.length} updates from Redis`)
				for (const update of existingUpdates) {
					try {
						Y.applyUpdate(doc, update, REDIS_ORIGIN)
					} catch (err) {
						Logger.yjsError(docName, `Error applying update from Redis:`, err)
					}
				}
				break // Success, exit retry loop
			}

			// Redis empty - try to acquire lock to fetch from database
			const gotLock = await RedisService.tryAcquireDocLock(docName)

			if (gotLock) {
				// We got the lock - fetch from DB
				Logger.yjsInfo(docName, `Acquired lock, fetching from database...`)
				try {
					await YjsSyncService.initializeFromRheaState({ doc, docName, metadata })
				} catch (err) {
					Logger.yjsError(docName, `Failed to fetch from database:`, err)
				} finally {
					await RedisService.releaseDocLock(docName)
				}
				break
			} else {
				// Another instance is loading - wait and retry
				Logger.yjsInfo(
					docName,
					`Lock held by another instance, waiting... (attempt ${attempt + 1}/${MAX_RETRIES})`,
				)
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
			}
		}

		// Listen for updates
		doc.on('update', async (update: Uint8Array, origin: unknown) => {
			// Schedule debounced flush to Rhea
			scheduleRheaPersistence(docName, doc, metadata)

			// Skip updates that came from Redis (to avoid echo)
			if (origin === REDIS_ORIGIN) {
				return
			}

			// Store update in Redis list (for new docs to load)
			await RedisService.appendDocumentUpdate(docName, update)

			// Broadcast to other Calliope instances (for real-time sync)
			RedisService.broadcastYjsUpdate(docName, update)
		})

		Logger.yjsInfo(docName, `Document ready`)
	},

	/**
	 * Handle incoming Yjs update from another Calliope instance.
	 */
	handleRemoteUpdate(docName: string, update: Uint8Array) {
		const doc = docs.get(docName)
		if (doc && !doc.isDestroyed) {
			try {
				Y.applyUpdate(doc, update, REDIS_ORIGIN)
			} catch (err) {
				Logger.yjsError(docName, `Error applying remote update:`, err)
			}
		}
	},

	async initializeFromRheaState({
		doc,
		docName,
		metadata,
	}: {
		doc: Y.Doc
		docName: string
		metadata: DocumentMetadata
	}) {
		const { contentHtml, contentDeltas } = await RheaService.fetchDocumentState(metadata)

		/**
		 * No content found at all -> likely an empty entity
		 */
		if (!contentHtml && !contentDeltas) {
			Logger.yjsInfo(docName, `No content in database`)
			return
		}

		if (contentDeltas) {
			/**
			 * Rhea has persistent deltas to load
			 */
			Y.applyUpdate(doc, Buffer.from(contentDeltas, 'base64'))
			Logger.yjsInfo(docName, `Loaded initial state from database deltas`)
		} else if (contentHtml) {
			/**
			 * Only HTML content available, generate deltas
			 */
			const fragment = doc.getXmlFragment('default')
			doc.transact(() => {
				htmlToYXml(contentHtml, fragment)
			}, REDIS_ORIGIN)

			// Flush the deltas back to Rhea immediately
			await flushDocumentToRhea(docName, doc, metadata)
			Logger.yjsInfo(docName, `Loaded initial state from database HTML`)
		}

		// Store the initial state to Redis so other instances get the same state
		const stateUpdate = Y.encodeStateAsUpdate(doc)
		await RedisService.appendDocumentUpdate(docName, stateUpdate)
		Logger.yjsInfo(docName, `Stored initial state to Redis`)
	},

	/**
	 * Set up global persistence hooks for document cleanup.
	 */
	setupGlobalHooks() {
		setPersistence({
			bindState: () => {},
			writeState: async (docName, doc) => {
				attachedDocs.delete(doc)
				Logger.yjsInfo(docName, `Document closing...`)

				// Cancel pending Rhea save
				const timer = rheaPersistenceTimers.get(docName)
				if (timer) {
					clearTimeout(timer)
					rheaPersistenceTimers.delete(docName)
				}

				const metadata = documentMetadata.get(docName)
				if (!metadata) {
					Logger.yjsWarn(docName, `No metadata, skipping final flush`)
					return
				}

				// Final flush to Rhea
				const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
				if (isLeader) {
					await flushDocumentToRhea(docName, doc, metadata)
				}

				documentMetadata.delete(docName)
				await persistenceLeaderService.release(docName)
				Logger.yjsInfo(docName, `Document closed`)
			},
			provider: null,
		})

		// Start periodic TTL refresh for all open documents
		setInterval(() => {
			for (const docName of docs.keys()) {
				RedisService.refreshDocumentTTL(docName).catch((err) => {
					Logger.yjsError(docName, `Failed to refresh TTL:`, err)
				})
			}
		}, TTL_REFRESH_INTERVAL_MS)
	},
}
