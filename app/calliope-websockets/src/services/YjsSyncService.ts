import { docs } from '@y/websocket-server/utils'
import { load } from 'cheerio'
import { Element, Text } from 'domhandler'
import * as Y from 'yjs'

import { persistenceLeaderService } from './PersistenceLeaderService.js'
import { RedisService } from './RedisService.js'
import { RheaService } from './RheaService.js'

const attachedDocs = new WeakSet<Y.Doc>()
const UPDATE_MESSAGE_ORIGIN = 'calliope-internal'

// Track debounce timers for each document
const persistenceTimers = new Map<string, NodeJS.Timeout>()
const DEBOUNCE_DELAY = 5000 // 5 seconds - wait for inactivity before attempting to save

export type YjsUpdateMessage = {
	docName: string
	update: string
}

function htmlToYXml(html: string, parent: Y.XmlFragment | Y.XmlElement) {
	const normalizedHtml = html.trim().startsWith('<') ? html : `<paragraph>${html}</paragraph>`

	const $ = load(normalizedHtml, { xmlMode: true })
	const root = $.root()

	function processNode(node: Element, yParent: Y.XmlFragment | Y.XmlElement) {
		node.childNodes.forEach((child) => {
			if (child instanceof Text) {
				const text = new Y.XmlText()
				text.insert(0, child.data)
				yParent.push([text])
			} else if (child instanceof Element) {
				const element = new Y.XmlElement(child.name)
				// Copy attributes
				if (child.attribs) {
					Object.entries(child.attribs).forEach(([key, value]) => {
						element.setAttribute(key, value)
					})
				}
				// Process children recursively
				if (child.childNodes && child.childNodes.length > 0) {
					processNode(child, element)
				}
				yParent.push([element])
			}
		})
	}

	root.contents().each((_, elem) => {
		if (elem instanceof Text) {
			const text = new Y.XmlText()
			text.insert(0, elem.data)
			parent.push([text])
		} else if (elem instanceof Element) {
			const element = new Y.XmlElement(elem.name)
			if (elem.attribs) {
				Object.entries(elem.attribs).forEach(([key, value]) => {
					element.setAttribute(key, value)
				})
			}
			if (elem.childNodes && elem.childNodes.length > 0) {
				processNode(elem, element)
			}
			parent.push([element])
		}
	})
}

function yXmlToHtml(fragment: Y.XmlFragment | Y.XmlElement): string {
	let html = ''

	fragment.forEach((item) => {
		if (item instanceof Y.XmlText) {
			html += item.toString()
		} else if (item instanceof Y.XmlElement) {
			html += `<${item.nodeName}`
			// Add attributes
			const attrs = item.getAttributes()
			for (const [key, value] of Object.entries(attrs)) {
				html += ` ${key}="${value}"`
			}
			html += '>'
			html += yXmlToHtml(item)
			html += `</${item.nodeName}>`
		}
	})

	return html
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
	if (!docs.has(docName)) {
		console.warn(`[${docName}] Document no longer exists, skipping flush`)
		return false
	}

	// Check if document is destroyed
	if (doc.isDestroyed) {
		console.warn(`[${docName}] Document is destroyed, skipping flush`)
		return false
	}

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
			Y.applyUpdate(doc, Buffer.from(update, 'base64'), UPDATE_MESSAGE_ORIGIN)
		}
	},

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
			console.warn(`Cannot attach Redis sync: document ${docName} not found`)
			return
		}

		if (attachedDocs.has(doc)) {
			return
		}

		console.info(`[${docName}] Creating a new document...`)
		const metadata = { userId, worldId, entityId, entityType }
		let initComplete = false

		doc.on('update', async (update: Uint8Array, origin: unknown) => {
			if (origin === UPDATE_MESSAGE_ORIGIN || !initComplete) {
				return
			}

			// Broadcast to other Calliope instances
			RedisService.broadcastYjsDocumentUpdate({
				docName,
				update: Buffer.from(update).toString('base64'),
			})

			// Schedule persistence (will try to acquire lock after debounce)
			schedulePersistence(docName, doc, metadata)
		})

		const contentRich = await RheaService.fetchDocumentState({
			userId,
			worldId,
			entityId,
			entityType,
		})

		const fragment = doc.getXmlFragment('default')

		// Only initialize if document is empty
		if (fragment.length === 0 && contentRich) {
			doc.transact(() => {
				htmlToYXml(contentRich, fragment)
			})
			console.info(`[${docName}] Initialized with content from database`)
		}

		// Flush on document destroy (final save before cleanup)
		doc.on('destroy', async () => {
			console.info(`[${docName}] Document destroying, attempting final flush...`)

			// Cancel any pending debounced save
			const timer = persistenceTimers.get(docName)
			if (timer) {
				clearTimeout(timer)
				persistenceTimers.delete(docName)
			}

			// Try to acquire leadership and flush immediately
			const isLeader = await persistenceLeaderService.tryAcquireLeadership(docName)
			if (isLeader) {
				await flushDocumentToRhea(docName, doc, metadata)
			} else {
				console.info(`[${docName}] Not leader on destroy, another instance will flush`)
			}
		})

		console.info(`[${docName}] Document created`)
		initComplete = true
		attachedDocs.add(doc)
	},
}
