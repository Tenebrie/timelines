import { RedisChannel, RheaToCalliopeMessage } from '@src/ts-shared/RheaToCalliopeMessage.js'
import { createClient } from 'redis'

import { RheaMessageHandlerService } from './RheaMessageHandlerService.js'

const client = createClient({
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

	await client.subscribe(RedisChannel.RHEA_TO_CALLIOPE, (message, channel) => {
		console.info(`Received message ${message} from ${channel}`)

		const parsedMessage = JSON.parse(message) as RheaToCalliopeMessage
		RheaMessageHandlerService.handleMessage(parsedMessage)
	})
}
