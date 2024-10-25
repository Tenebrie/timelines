import { createClient } from 'redis'

import { RedisChannel } from '../../ts-shared/RheaToCalliopeMessage'

const rawClient = createClient({
	socket: {
		host: 'redis',
	},
})
rawClient.on('error', (err) => console.log('Redis Client Error', err))

export const getRedisClient = () => rawClient

export const openRedisChannel = <T>(channel: RedisChannel) => ({
	sendMessage: (message: T) => rawClient.publish(channel, JSON.stringify(message)),
})
