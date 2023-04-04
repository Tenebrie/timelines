import { User } from '@prisma/client'
import { createClient } from 'redis'

const client = createClient({
	socket: {
		host: 'redis',
	},
})

client.on('error', (err) => console.log('Redis Client Error', err))

export const initRedisConnection = async () => {
	await client.connect()
}

export const RedisService = {
	notifyAboutWorldUpdate: (user: User, worldId: string) => {
		const message = {
			userId: user.id,
			worldId,
			timestamp: new Date().toISOString(),
		}
		client.publish('worldUpdate', JSON.stringify(message))
	},
}
