import { User, WorldEvent } from '@prisma/client'

import {
	RedisChannel,
	RheaToCalliopeMessage,
	RheaToCalliopeMessageType,
} from '../ts-shared/RheaToCalliopeMessage'
import { getRedisClient, openRedisChannel } from './dbClients/RedisClient'

const calliope = openRedisChannel<RheaToCalliopeMessage>(RedisChannel.RHEA_TO_CALLIOPE)

export const RedisService = {
	initRedisConnection: async () => {
		await getRedisClient().connect()
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

	notifyAboutWorldEventUpdate: ({
		user,
		worldId,
		event,
	}: {
		user: User
		worldId: string
		event: WorldEvent
	}) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_EVENT_UPDATED,
			data: {
				userId: user.id,
				worldId,
				event: JSON.stringify(event, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
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
