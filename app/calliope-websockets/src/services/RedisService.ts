import { RedisChannel, RheaToCalliopeMessage } from '@src/ts-shared/RheaToCalliopeMessage.js'
import { createClient } from 'redis'

import { RheaMessageHandlerService } from './RheaMessageHandlerService.js'
import { YjsSyncService } from './YjsSyncService.js'

const client = createClient({
	socket: {
		host: 'redis',
	},
})

const publisherClient = createClient({
	socket: {
		host: 'redis',
	},
})

client.on('connect', () => {
	console.info('Connection to Redis established!')
})

client.on('error', (err) => {
	console.error('Redis Client Error', err)
	if (!client.isReady) {
		console.info('Connection to Redis failing, retrying...')
	}
})

// Redis key prefix for Yjs document updates
const YJS_DOC_KEY_PREFIX = 'yjs:doc:'
const YJS_LOCK_KEY_PREFIX = 'yjs:lock:'
const LOCK_TTL_MS = 5000 // Lock expires after 5 seconds

export type YjsUpdateMessage = {
	docName: string
	update: string
}

export const initRedisConnection = async () => {
	console.info('Connecting to Redis...')
	await client.connect()
	await publisherClient.connect()

	await client.subscribe(RedisChannel.RHEA_TO_CALLIOPE, (message) => {
		const parsedMessage = JSON.parse(message) as RheaToCalliopeMessage
		RheaMessageHandlerService.handleMessage(parsedMessage)
	})

	// Subscribe to Yjs updates from other Calliope instances
	await client.subscribe(RedisChannel.CALLIOPE_YJS, (message) => {
		try {
			const parsedMessage = JSON.parse(message) as YjsUpdateMessage
			const update = Buffer.from(parsedMessage.update, 'base64')
			YjsSyncService.handleRemoteUpdate(parsedMessage.docName, update)
		} catch (err) {
			console.error('Error parsing Yjs update from Redis:', err)
		}
	})
}

export const RedisService = {
	/**
	 * Broadcast a Yjs update to other Calliope instances via pub/sub.
	 */
	broadcastYjsUpdate: (docName: string, update: Uint8Array): void => {
		const message: YjsUpdateMessage = {
			docName,
			update: Buffer.from(update).toString('base64'),
		}
		publisherClient
			.publish(RedisChannel.CALLIOPE_YJS, JSON.stringify(message))
			.catch((err) => console.error('Error broadcasting Yjs update:', err))
	},

	/**
	 * Append a Yjs update to the document's update list in Redis (for persistence).
	 */
	appendDocumentUpdate: async (docName: string, update: Uint8Array): Promise<void> => {
		const key = `${YJS_DOC_KEY_PREFIX}${docName}`
		const base64Update = Buffer.from(update).toString('base64')
		await publisherClient.rPush(key, base64Update)
	},

	/**
	 * Get all stored updates for a document from Redis.
	 */
	getDocumentUpdates: async (docName: string): Promise<Uint8Array[]> => {
		const key = `${YJS_DOC_KEY_PREFIX}${docName}`
		const updates = await publisherClient.lRange(key, 0, -1)
		return updates.map((base64) => Buffer.from(base64, 'base64'))
	},

	/**
	 * Delete all updates for a document from Redis.
	 */
	deleteDocumentUpdates: async (docName: string): Promise<void> => {
		const key = `${YJS_DOC_KEY_PREFIX}${docName}`
		await publisherClient.del(key)
	},

	/**
	 * Try to acquire a lock for initial document loading.
	 * Returns true if lock acquired, false if another instance holds the lock.
	 */
	tryAcquireDocLock: async (docName: string): Promise<boolean> => {
		const key = `${YJS_LOCK_KEY_PREFIX}${docName}`
		const result = await publisherClient.set(key, '1', {
			NX: true, // Only set if doesn't exist
			PX: LOCK_TTL_MS, // Expire after TTL
		})
		return result === 'OK'
	},

	/**
	 * Release the document loading lock.
	 */
	releaseDocLock: async (docName: string): Promise<void> => {
		const key = `${YJS_LOCK_KEY_PREFIX}${docName}`
		await publisherClient.del(key)
	},
}
