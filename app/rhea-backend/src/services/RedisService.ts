import { User } from '@prisma/client'
import { createClient } from 'redis'

import {
	RedisChannel,
	RheaToCalliopeMessage,
	RheaToCalliopeMessageType,
} from '../ts-shared/RheaToCalliopeMessage'

const rawClient = createClient({
	socket: {
		host: 'redis',
	},
})
rawClient.on('error', (err) => console.log('Redis Client Error', err))

const makeClient = <T>(channel: RedisChannel) => ({
	sendMessage: (message: T) => rawClient.publish(channel, JSON.stringify(message)),
})

const calliope = makeClient<RheaToCalliopeMessage>(RedisChannel.RHEA_TO_CALLIOPE)

export const RedisService = {
	initRedisConnection: async () => {
		await rawClient.connect()
	},

	notifyAboutNewAnnouncement: ({ userId }: { userId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.ANNOUNCEMENT,
			data: {
				userId,
			},
		})
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
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UPDATED,
			data: {
				userId: user.id,
				worldId,
				timestamp: timestamp.toISOString(),
			},
		})
	},

	notifyAboutWorldShared: ({ users, worldId }: { users: User[]; worldId: string }) => {
		users.forEach((user) => {
			calliope.sendMessage({
				type: RheaToCalliopeMessageType.WORLD_UNSHARED,
				data: {
					userId: user.id,
					worldId,
				},
			})
		})
	},

	notifyAboutWorldUnshared: ({ userId, worldId }: { userId: string; worldId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UNSHARED,
			data: {
				userId,
				worldId,
			},
		})
	},
}
