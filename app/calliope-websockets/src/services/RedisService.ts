import { createClient } from 'redis'

import { WebsocketService } from './WebsocketService'

const client = createClient({
	socket: {
		host: 'redis',
	},
})

client.on('error', (err) => console.log('Redis Client Error', err))

export const initRedisConnection = async () => {
	await client.connect()

	await client.subscribe('worldUpdate', (message, channel) => {
		console.log(`Received message ${message} from ${channel}`)

		const parsedMessage = JSON.parse(message) as {
			userId: string
			worldId: string
			timestamp: string
		}

		const sockets = WebsocketService.findClients(parsedMessage.userId)
		console.log(sockets.length)
		sockets.forEach((socket) =>
			socket.send(
				JSON.stringify({
					type: 'worldUpdate',
					data: {
						worldId: parsedMessage.worldId,
						timestamp: parsedMessage.timestamp,
					},
				})
			)
		)
	})
}
