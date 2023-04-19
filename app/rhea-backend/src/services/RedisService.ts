import { User } from '@prisma/client'
import { createClient } from 'redis'

import type {
	RheaToCalliopeChannel,
	RheaToCalliopeMessage,
} from '../../../calliope-websockets/src/types/rheaToCalliope'

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
	notifyCalliope: (channel: RheaToCalliopeMessage['channel'], message: RheaToCalliopeMessage['data']) => {
		client.publish(channel, JSON.stringify(message))
	},

	notifyAboutWorldUpdate: ({
		user,
		worldId,
		timestamp,
	}: {
		user: User
		worldId: string
		timestamp: Date
	}) => {
		RedisService.notifyCalliope('worldUpdate' as RheaToCalliopeChannel, {
			userId: user.id,
			worldId,
			timestamp: timestamp.toISOString(),
		})
	},
}
