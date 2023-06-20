import { WORLD_UPDATE_NAME } from '@src/ts-shared/socketdef'
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

	await client.subscribe(WORLD_UPDATE_NAME, (message, channel) => {
		console.info(`Received message ${message} from ${channel}`)

		const parsedMessage = JSON.parse(message) as {
			userId: string
			worldId: string
			timestamp: string
		}

		const sockets = WebsocketService.findClients(parsedMessage.userId)
		sockets.forEach((socket) =>
			socket.send(
				JSON.stringify({
					type: WORLD_UPDATE_NAME,
					data: {
						worldId: parsedMessage.worldId,
						timestamp: parsedMessage.timestamp,
					},
				})
			)
		)
	})
}
