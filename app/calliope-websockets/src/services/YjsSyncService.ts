import { Logger } from '@src/utils/logger.js'
import { docs, getYDoc, setPersistence } from '@y/websocket-server/utils'
import * as Y from 'yjs'

import { persistenceLeaderService } from './PersistenceLeaderService.js'
import { RedisService } from './RedisService.js'
import { RheaService } from './RheaService.js'
import { htmlToYDoc, yDocToHtml } from './YjsParserService.js'

const attachedDocs = new WeakSet<Y.Doc>()

// Origin marker for updates from Redis (to avoid echo)
const REDIS_ORIGIN = 'redis'

// TTL refresh interval (30 seconds, must be less than Redis TTL of 60 seconds)
const TTL_REFRESH_INTERVAL_MS = 30_000

// Track debounce timers for flushing to Rhea (database persistence)
const rheaPersistenceTimers = new Map<string, NodeJS.Timeout>()
const RHEA_DEBOUNCE_DELAY = 2000

const RHEA_FLUSH_RETRY_DELAY = 5000
const RHEA_FLUSH_MAX_ATTEMPTS = 60

// Store metadata per document
export type DocumentMetadata = {
	docName: string
	lastWritingUserId: string | null
	worldId: string
	entityId: string
	entityType: 'actor' | 'event' | 'article'
	isLoaded: boolean
	isDirty: boolean
	loadPromise: Promise<void> | null
}
const documentMetadata = new Map<string, DocumentMetadata>()

type FlushResult = 'flushed' | 'skipped' | 'failed'

/**
 * Flush document state to Rhea
 */
async function flushDocumentToRhea(doc: Y.Doc, metadata: DocumentMetadata): Promise<FlushResult> {
	const docName = metadata.docName
	if (!metadata.isLoaded) {
		Logger.yjsWarn(docName, `Attempted to flush to Rhea, but the document never finished loading`)
		return 'skipped'
	}

	if (metadata.lastWritingUserId === null) {
		Logger.yjsWarn(docName, `Attempted to flush to Rhea, but no user write is recorded`)
		return 'skipped'
	}

	// Clear before serializing: updates arriving mid-flush must re-dirty the document
	metadata.isDirty = false

	try {
		const html = yDocToHtml(doc)

		await RheaService.flushDocumentState({
			lastUserId: metadata.lastWritingUserId,
			worldId: metadata.worldId,
			entityId: metadata.entityId,
			entityType: metadata.entityType,
			contentRich: html,
		})

		Logger.yjsInfo(docName, `Flushed to Rhea`)
		return 'flushed'
	} catch (error) {
		metadata.isDirty = true
		Logger.yjsError(docName, `Failed to flush to Rhea:`, error)
		return 'failed'
	}
}

export function recordLastWritingUser(docName: string, userId: string) {
	Logger.yjsInfo(docName, `Recording last writing user: ${userId}`)
	documentMetadata.get(docName)!.lastWritingUserId = userId
}

/**
 * Schedule a debounced save to Rhea.
 */
function scheduleRheaPersistence(
	docName: string,
	doc: Y.Doc,
	metadata: DocumentMetadata,
	delay: number = RHEA_DEBOUNCE_DELAY,
) {
	const existingTimer = rheaPersistenceTimers.get(docName)
	if (existingTimer) {
		clearTimeout(existingTimer)
	}

	const timer = setTimeout(async () => {
		rheaPersistenceTimers.delete(docName)

		if (!metadata.isLoaded || !metadata.isDirty) {
			return
		}

		// The document has been closed and reopened
		if (documentMetadata.get(docName) !== metadata) {
			return
		}

		let result: FlushResult = 'failed'
		try {
			const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
			if (isLeader) {
				result = await flushDocumentToRhea(doc, metadata)
			}
		} catch (error) {
			Logger.yjsError(docName, `Error during scheduled flush:`, error)
		}

		// Not flushed and the session is still current - keep retrying until it goes through
		if (result === 'failed' && documentMetadata.get(docName) === metadata) {
			scheduleRheaPersistence(docName, doc, metadata, RHEA_FLUSH_RETRY_DELAY)
		}
	}, delay)

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
		accessLevel,
		worldId,
		entityId,
		entityType,
		docName,
	}: {
		userId: string
		accessLevel: 'write' | 'read'
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
		docName: string
	}) {
		const doc = getYDoc(docName, true)

		if (attachedDocs.has(doc)) {
			// Another connection is (or was) loading this document - wait for that load to finish
			await documentMetadata.get(docName)?.loadPromise
			return
		}
		attachedDocs.add(doc)

		const metadata: DocumentMetadata = {
			docName,
			lastWritingUserId: accessLevel === 'write' ? userId : null,
			worldId,
			entityId,
			entityType,
			isLoaded: false,
			isDirty: false,
			loadPromise: null,
		}
		documentMetadata.set(docName, metadata)

		// Load initial state
		metadata.loadPromise = YjsSyncService.loadDocumentState({ userId, metadata, doc })
		try {
			await metadata.loadPromise
		} catch (error) {
			Logger.yjsError(docName, `Failed to load initial state:`, error)
			documentMetadata.delete(docName)
			attachedDocs.delete(doc)
			throw error
		}

		// Listen for updates
		doc.on('update', async (update: Uint8Array, origin: unknown) => {
			// Mark dirty and schedule a debounced flush to Rhea
			metadata.isDirty = true
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

	loadDocumentState: async ({
		userId,
		metadata,
		doc,
	}: {
		userId: string
		metadata: DocumentMetadata
		doc: Y.Doc
	}) => {
		// Load existing state: first try Redis, then fall back to database
		// Use a lock to prevent race conditions when multiple instances start at the same time
		Logger.yjsInfo(metadata.docName, `Loading state...`)

		const MAX_RETRIES = 20
		const RETRY_DELAY_MS = 25

		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			const existingUpdates = await RedisService.getDocumentUpdates(metadata.docName)

			if (existingUpdates.length > 0) {
				// Redis has updates - apply them
				Logger.yjsInfo(metadata.docName, `Applying ${existingUpdates.length} updates from Redis`)
				for (const update of existingUpdates) {
					try {
						Y.applyUpdate(doc, update, REDIS_ORIGIN)
					} catch (err) {
						Logger.yjsError(metadata.docName, `Error applying update from Redis:`, err)
					}
				}
				metadata.isLoaded = true
				metadata.isDirty = true
				break // Success, exit retry loop
			}

			// Redis empty - try to acquire lock to fetch from database
			const gotLock = await RedisService.tryAcquireDocLock(metadata.docName)

			if (gotLock) {
				// We got the lock - fetch from DB
				Logger.yjsInfo(metadata.docName, `Acquired lock, fetching from database...`)
				try {
					// await new Promise((resolve) => setTimeout(resolve, 3000))
					await YjsSyncService.initializeFromRheaState({ userId, doc, metadata })
					metadata.isLoaded = true
				} catch (err) {
					Logger.yjsError(metadata.docName, `Failed to fetch from database:`, err)
				} finally {
					await RedisService.releaseDocLock(metadata.docName)
				}
				break
			} else {
				// Another instance is loading - wait and retry
				Logger.yjsInfo(
					metadata.docName,
					`Lock held by another instance, waiting... (attempt ${attempt + 1}/${MAX_RETRIES})`,
				)
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
			}
		}
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

	/**
	 * Reset a document: close all client connections, delete Redis cache, and clean up.
	 * This forces all clients to disconnect and re-fetch the document state from the database.
	 */
	async resetDocument(worldId: string, entityId: string) {
		const docName = `${worldId}:${entityId}`
		Logger.yjsInfo(docName, `Document reset requested`)

		// Cancel pending Rhea persistence timer
		const timer = rheaPersistenceTimers.get(docName)
		if (timer) {
			clearTimeout(timer)
			rheaPersistenceTimers.delete(docName)
		}

		// Delete cached updates from Redis
		await RedisService.deleteDocumentUpdates(docName)

		// Clean up metadata
		documentMetadata.delete(docName)

		// Close all client connections on this document (triggers cleanup in y-websocket-server)
		const doc = docs.get(docName)
		if (doc) {
			attachedDocs.delete(doc)
			const connections = Array.from(doc.conns.keys())
			for (const conn of connections) {
				try {
					conn.close(4001, 'Document reset')
				} catch {
					// Connection may already be closed
				}
			}
			Logger.yjsInfo(docName, `Closed ${connections.length} client connection(s)`)
		}

		// Release leadership if held
		await persistenceLeaderService.release(docName)

		Logger.yjsInfo(docName, `Document reset complete`)
	},

	async initializeFromRheaState({
		userId,
		doc,
		metadata,
	}: {
		userId: string
		doc: Y.Doc
		metadata: DocumentMetadata
	}) {
		const { contentHtml } = await RheaService.fetchDocumentState(userId, metadata)

		if (!contentHtml) {
			Logger.yjsInfo(metadata.docName, `No content in database`)
			return
		}

		doc.transact(() => {
			htmlToYDoc(contentHtml, doc)
		}, REDIS_ORIGIN)
		Logger.yjsInfo(metadata.docName, `Loaded initial state from database`)

		// Store the initial state to Redis so other instances get the same state
		const stateUpdate = Y.encodeStateAsUpdate(doc)
		await RedisService.appendDocumentUpdate(metadata.docName, stateUpdate)
		Logger.yjsInfo(metadata.docName, `Stored initial state to Redis`)
	},

	/**
	 * Flush all dirty documents immediately. Called on graceful shutdown, where there is
	 * no time for retries - a single attempt per document, all in parallel.
	 */
	async flushAllDocuments() {
		const dirtyDocs = Array.from(documentMetadata.values()).filter(
			(metadata) => metadata.isDirty && metadata.isLoaded,
		)
		if (dirtyDocs.length === 0) {
			return
		}

		console.info(`Flushing ${dirtyDocs.length} dirty document(s) before shutdown...`)
		await Promise.allSettled(
			dirtyDocs.map(async (metadata) => {
				const docName = metadata.docName
				const doc = docs.get(docName)
				if (!doc) {
					return
				}
				try {
					const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
					if (isLeader) {
						await flushDocumentToRhea(doc, metadata)
					} else {
						// A peer instance owns persistence - give it the largest possible window
						await RedisService.refreshDocumentTTL(docName)
					}
				} catch (error) {
					Logger.yjsError(docName, `Failed to flush during shutdown:`, error)
				}
			}),
		)
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

				for (let attempt = 1; metadata.isDirty && attempt <= RHEA_FLUSH_MAX_ATTEMPTS; attempt++) {
					if (documentMetadata.get(docName) !== metadata) {
						Logger.yjsInfo(docName, `A new session took over the document, skipping final flush`)
						return
					}

					let result: FlushResult = 'failed'
					try {
						const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
						if (isLeader) {
							result = await flushDocumentToRhea(doc, metadata)
						}
					} catch (error) {
						Logger.yjsError(docName, `Error during final flush:`, error)
					}

					if (result !== 'failed') {
						break
					}
					if (attempt === RHEA_FLUSH_MAX_ATTEMPTS) {
						Logger.yjsError(docName, `Final flush failed after ${attempt} attempts, giving up`)
						break
					}

					Logger.yjsWarn(docName, `Final flush failed (attempt ${attempt}), retrying...`)
					await new Promise((resolve) => setTimeout(resolve, RHEA_FLUSH_RETRY_DELAY))
				}

				if (documentMetadata.get(docName) !== metadata) {
					Logger.yjsInfo(docName, `A new session took over the document`)
					return
				}
				documentMetadata.delete(docName)
				try {
					await persistenceLeaderService.release(docName)
				} catch (error) {
					Logger.yjsError(docName, `Failed to release leadership:`, error)
				}
				Logger.yjsInfo(docName, `Document closed`)
			},
			provider: null,
		})

		// Start periodic TTL refresh for all tracked documents
		setInterval(() => {
			for (const docName of documentMetadata.keys()) {
				RedisService.refreshDocumentTTL(docName).catch((err) => {
					Logger.yjsError(docName, `Failed to refresh TTL:`, err)
				})
			}
		}, TTL_REFRESH_INTERVAL_MS)
	},
}
