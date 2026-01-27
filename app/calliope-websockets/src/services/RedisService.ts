import { RedisChannel, RheaToCalliopeMessage } from '@src/ts-shared/RheaToCalliopeMessage.js'
import { createClient } from 'redis'

import { RheaMessageHandlerService } from './RheaMessageHandlerService.js'
import { YjsSyncService, YjsUpdateMessage } from './YjsSyncService.js'

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

export const initRedisConnection = async () => {
	console.info('Connecting to Redis...')
	await client.connect()
	await publisherClient.connect()

	await client.subscribe(RedisChannel.RHEA_TO_CALLIOPE, (message) => {
		const parsedMessage = JSON.parse(message) as RheaToCalliopeMessage
		RheaMessageHandlerService.handleMessage(parsedMessage)
	})

	await client.subscribe(RedisChannel.CALLIOPE_YJS, (message) => {
		try {
			const parsedMessage = JSON.parse(message) as YjsUpdateMessage
			YjsSyncService.handleMessage(parsedMessage)
		} catch (err) {
			console.error('Error applying Yjs update from Redis:', err)
		}
	})
}

export const RedisService = {
	broadcastYjsDocumentUpdate: (message: YjsUpdateMessage) => {
		publisherClient
			.publish(RedisChannel.CALLIOPE_YJS, JSON.stringify(message))
			.catch((err) => console.error('Error publishing Yjs update to Redis:', err))
	},
}
