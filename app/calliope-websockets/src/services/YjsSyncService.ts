import { docs, setPersistence } from '@y/websocket-server/utils'
import * as Y from 'yjs'

import { persistenceLeaderService } from './PersistenceLeaderService.js'
import { RedisService } from './RedisService.js'
import { RheaService } from './RheaService.js'
import { htmlToYXml, yXmlToHtml } from './YjsParserService.js'

const UPDATE_MESSAGE_ORIGIN = 'calliope-internal'

// Track debounce timers for each document
const persistenceTimers = new Map<string, NodeJS.Timeout>()
const DEBOUNCE_DELAY = 1000

// Store metadata per document for use in writeState hook
type DocumentMetadata = {
	userId: string
	worldId: string
	entityId: string
	entityType: 'actor' | 'event' | 'article'
}
const documentMetadata = new Map<string, DocumentMetadata>()

export type YjsUpdateMessage = {
	docName: string
	update: string
}

/**
 * Safely flush document state to Rhea.
 * Returns true if flush succeeded, false otherwise.
 */
async function flushDocumentToRhea(
	docName: string,
	doc: Y.Doc,
	metadata: {
		userId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
	},
): Promise<boolean> {
	// Check if document is still valid (not destroyed)
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

		console.info(`[${docName}] Successfully flushed to Rhea`)
		return true
	} catch (error) {
		console.error(`[${docName}] Failed to flush to Rhea:`, error)
		return false
	}
}

/**
 * Schedule a debounced save to Rhea backend.
 * After debounce expires, tries to acquire leadership and saves if successful.
 * This ensures we only save if we can acquire the lock at save time.
 */
async function schedulePersistence(
	docName: string,
	doc: Y.Doc,
	metadata: {
		userId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
	},
) {
	// Clear existing timer - restart the debounce
	const existingTimer = persistenceTimers.get(docName)
	if (existingTimer) {
		clearTimeout(existingTimer)
	}

	// Schedule new save after inactivity
	const timer = setTimeout(async () => {
		persistenceTimers.delete(docName)

		const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
		if (!isLeader) {
			console.debug(`[${docName}] Not leader, skipping save`)
			return
		}

		console.info(`[${docName}] Acquired leadership, flushing to Rhea...`)
		await flushDocumentToRhea(docName, doc, metadata)
	}, DEBOUNCE_DELAY)

	persistenceTimers.set(docName, timer)
}

export const YjsSyncService = {
	handleMessage(message: YjsUpdateMessage) {
		const { docName, update } = message
		const doc = docs.get(docName)
		if (doc) {
			console.log('Update received', update)
			console.log(`[${docName}] Document found, applying update. Doc destroyed: ${doc.isDestroyed}`)
			try {
				Y.applyUpdate(doc, Buffer.from(update, 'base64'), UPDATE_MESSAGE_ORIGIN)
				console.log(`[${docName}] Update applied successfully`)
			} catch (err) {
				console.error(`[${docName}] Error applying update:`, err)
			}
		} else {
			console.log('No doc ' + docName)
			console.log('Available docs:', Array.from(docs.keys()))
		}
	},

	registerDocumentMetadata({
		docName,
		userId,
		worldId,
		entityId,
		entityType,
	}: {
		docName: string
		userId: string
		worldId: string
		entityId: string
		entityType: 'actor' | 'event' | 'article'
	}) {
		documentMetadata.set(docName, { userId, worldId, entityId, entityType })
	},

	setupGlobalHooks() {
		setPersistence({
			bindState: async (docName, doc) => {
				const metadata = documentMetadata.get(docName)
				if (!metadata) {
					console.warn(`[${docName}] No metadata found in bindState, skipping setup`)
					return
				}

				console.info(`[${docName}] bindState: Setting up document...`)

				doc.on('update', async (update: Uint8Array, origin: unknown) => {
					schedulePersistence(docName, doc, metadata)

					// If this is a local update, broadcast to other instances
					if (origin !== UPDATE_MESSAGE_ORIGIN) {
						console.info(`[${docName}] Broadcasting update to other instances`)
						RedisService.broadcastYjsDocumentUpdate({
							docName,
							update: Buffer.from(update).toString('base64'),
						})
					}
				})

				const contentRich = await RheaService.fetchDocumentState({
					userId: metadata.userId,
					worldId: metadata.worldId,
					entityId: metadata.entityId,
					entityType: metadata.entityType,
				})

				const fragment = doc.getXmlFragment('default')

				if (contentRich) {
					doc.transact(() => {
						if (fragment.length === 0) {
							htmlToYXml(contentRich, fragment)
						}
					})
					console.info(`[${docName}] Initialized with content from database`)
				}

				console.info(`[${docName}] Document setup complete`)
			},
			writeState: async (docName, doc) => {
				console.info(`[${docName}] writeState: Document destroying, attempting final flush...`)

				// Cancel any pending debounced save
				const timer = persistenceTimers.get(docName)
				if (timer) {
					clearTimeout(timer)
					persistenceTimers.delete(docName)
				}

				const metadata = documentMetadata.get(docName)
				if (!metadata) {
					console.warn(`[${docName}] No metadata found, skipping flush`)
					return
				}

				// Try to acquire leadership and flush immediately
				const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
				if (isLeader) {
					await flushDocumentToRhea(docName, doc, metadata)
				} else {
					console.info(`[${docName}] Not leader on destroy, another instance will flush`)
				}

				// Clean up metadata
				documentMetadata.delete(docName)
			},
			provider: null,
		})
	},
}
