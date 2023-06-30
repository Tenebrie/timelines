import { CalliopeToClientMessageType } from '@src/ts-shared/CalliopeToClientMessage'
import { RedisChannel } from '@src/ts-shared/RheaToCalliopeMessage'
import { createClient } from 'redis'

import { WebsocketService } from './WebsocketService'

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

		const parsedMessage = JSON.parse(message) as {
			userId: string
			worldId: string
			timestamp: string
		}

		const clients = WebsocketService.findClients(parsedMessage.userId)
		clients.forEach((client) =>
			client.sendMessage({
				type: CalliopeToClientMessageType.WORLD_UPDATED,
				data: {
					worldId: parsedMessage.worldId,
					timestamp: parsedMessage.timestamp,
				},
			})
		)
	})
}
