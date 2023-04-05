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
	notifyAboutWorldUpdate: ({
		user,
		worldId,
		timestamp,
	}: {
		user: User
		worldId: string
		timestamp: Date
	}) => {
		const message = {
			userId: user.id,
			worldId,
			timestamp,
		}
		client.publish('worldUpdate', JSON.stringify(message))
	},
}
