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

// Store metadata per document
export type DocumentMetadata = {
	docName: string
	lastWritingUserId: string | null
	worldId: string
	entityId: string
	entityType: 'actor' | 'event' | 'article'
	isLoaded: boolean
	loadPromise: Promise<void> | null
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
	if (!metadata.isLoaded) {
		Logger.yjsWarn(docName, `Attempted to flush to Rhea, but the document never finished loading`)
		return false
	}

	if (metadata.lastWritingUserId === null) {
		Logger.yjsWarn(docName, `Attempted to flush to Rhea, but no user write is recorded`)
		return false
	}

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
		return true
	} catch (error) {
		Logger.yjsError(docName, `Failed to flush to Rhea:`, error)
		return false
	}
}

export function recordLastWritingUser(docName: string, userId: string) {
	Logger.yjsInfo(docName, `Recording last writing user: ${userId}`)
	documentMetadata.get(docName)!.lastWritingUserId = userId
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

		if (!metadata.isLoaded) {
			return
		}

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
				break // Success, exit retry loop
			}

			// Redis empty - try to acquire lock to fetch from database
			const gotLock = await RedisService.tryAcquireDocLock(metadata.docName)

			if (gotLock) {
				// We got the lock - fetch from DB
				Logger.yjsInfo(metadata.docName, `Acquired lock, fetching from database...`)
				try {
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
