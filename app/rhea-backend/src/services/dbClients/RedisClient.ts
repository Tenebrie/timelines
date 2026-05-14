import { RedisChannel } from '@src/ts-shared/RedisChannel.js'
import { createClient } from 'redis'

const rawClient = createClient({
	socket: {
		host: 'redis',
	},
})
rawClient.on('error', (err) => console.info('Redis Client Error', err))

export const getRedisClient = () => rawClient

export const openRedisChannel = <T>(channel: RedisChannel) => ({
	sendMessage: (message: T) => rawClient.publish(channel, JSON.stringify(message)),
})
