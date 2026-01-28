import { docs, setPersistence } from '@y/websocket-server/utils'
import * as Y from 'yjs'

import { persistenceLeaderService } from './PersistenceLeaderService.js'
import { RedisService } from './RedisService.js'
import { RheaService } from './RheaService.js'
import { htmlToYXml, yXmlToHtml } from './YjsParserService.js'

const attachedDocs = new WeakSet<Y.Doc>()

// Origin marker for updates from Redis (to avoid echo)
const REDIS_ORIGIN = 'redis'

// Track debounce timers for flushing to Rhea (database persistence)
const rheaPersistenceTimers = new Map<string, NodeJS.Timeout>()
const RHEA_DEBOUNCE_DELAY = 2000

// Store metadata per document
type DocumentMetadata = {
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
		})

		console.info(`[${docName}] Flushed to Rhea`)
		return true
	} catch (error) {
		console.error(`[${docName}] Failed to flush to Rhea:`, error)
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
			console.warn(`[${docName}] Document not found`)
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
		console.info(`[${docName}] Loading state...`)

		const MAX_RETRIES = 20
		const RETRY_DELAY_MS = 25

		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			const existingUpdates = await RedisService.getDocumentUpdates(docName)

			if (existingUpdates.length > 0) {
				// Redis has updates - apply them
				console.info(`[${docName}] Applying ${existingUpdates.length} updates from Redis`)
				for (const update of existingUpdates) {
					try {
						Y.applyUpdate(doc, update, REDIS_ORIGIN)
					} catch (err) {
						console.error(`[${docName}] Error applying update from Redis:`, err)
					}
				}
				break // Success, exit retry loop
			}

			// Redis empty - try to acquire lock to fetch from database
			const gotLock = await RedisService.tryAcquireDocLock(docName)

			if (gotLock) {
				// We got the lock - fetch from DB
				console.info(`[${docName}] Acquired lock, fetching from database...`)
				try {
					const contentRich = await RheaService.fetchDocumentState({
						userId,
						worldId,
						entityId,
						entityType,
					})
					if (contentRich && contentRich.trim() !== '') {
						const fragment = doc.getXmlFragment('default')
						doc.transact(() => {
							htmlToYXml(contentRich, fragment)
						}, REDIS_ORIGIN)
						console.info(`[${docName}] Loaded initial state from database`)

						// Store the initial state to Redis so other instances get the same state
						const stateUpdate = Y.encodeStateAsUpdate(doc)
						await RedisService.appendDocumentUpdate(docName, stateUpdate)
						console.info(`[${docName}] Stored initial state to Redis`)
					} else {
						console.info(`[${docName}] No content in database`)
					}
				} catch (err) {
					console.error(`[${docName}] Failed to fetch from database:`, err)
				} finally {
					await RedisService.releaseDocLock(docName)
				}
				break // Done, exit retry loop
			} else {
				// Another instance is loading - wait and retry
				console.info(
					`[${docName}] Lock held by another instance, waiting... (attempt ${attempt + 1}/${MAX_RETRIES})`,
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

		console.info(`[${docName}] Document ready`)
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
				console.error(`[${docName}] Error applying remote update:`, err)
			}
		}
	},

	/**
	 * Set up global persistence hooks for document cleanup.
	 */
	setupGlobalHooks() {
		setPersistence({
			bindState: () => {},
			writeState: async (docName, doc) => {
				attachedDocs.delete(doc)
				console.info(`[${docName}] Document closing...`)

				// Cancel pending Rhea save
				const timer = rheaPersistenceTimers.get(docName)
				if (timer) {
					clearTimeout(timer)
					rheaPersistenceTimers.delete(docName)
				}

				const metadata = documentMetadata.get(docName)
				if (!metadata) {
					console.warn(`[${docName}] No metadata, skipping final flush`)
					return
				}

				// Final flush to Rhea
				const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
				if (isLeader) {
					await flushDocumentToRhea(docName, doc, metadata)

					// Clear Redis - state is persisted to database, no need to keep in Redis
					// await RedisService.deleteDocumentUpdates(docName)
				}

				persistenceLeaderService.release(docName)
				documentMetadata.delete(docName)
				console.info(`[${docName}] Document closed`)
			},
			provider: null,
		})
	},
}
