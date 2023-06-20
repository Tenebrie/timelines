import { CalliopeToClientMessageType } from '@src/ts-shared/CalliopeToClientMessage'
import { createClient } from 'redis'

import { WebsocketService } from './WebsocketService'

const client = createClient({
	socket: {
		host: 'redis',
	},
})

client.on('error', (err) => console.error('Redis Client Error', err))

export const initRedisConnection = async () => {
	await client.connect()

	await client.subscribe('rhea-to-calliope', (message, channel) => {
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
