import { User, WorldEvent, WorldEventDelta } from '@prisma/client'

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

	notifyAboutWorldUpdate: ({ worldId, timestamp }: { worldId: string; timestamp: Date }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UPDATED,
			data: {
				worldId,
				timestamp: timestamp.toISOString(),
			},
		})
	},

	notifyAboutWorldEventUpdate: ({ worldId, event }: { worldId: string; event: WorldEvent }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_EVENT_UPDATED,
			data: {
				worldId,
				event: JSON.stringify(event, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
			},
		})
	},

	notifyAboutWorldEventDeltaUpdate: ({ worldId, delta }: { worldId: string; delta: WorldEventDelta }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_EVENT_DELTA_UPDATED,
			data: {
				worldId,
				eventDelta: JSON.stringify(delta, (_, value) =>
					typeof value === 'bigint' ? value.toString() : value
				),
			},
		})
	},

	notifyAboutWorldTracksUpdate: ({ worldId, timestamp }: { worldId: string; timestamp: Date }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_TRACKS_UPDATED,
			data: {
				worldId,
				timestamp: timestamp.toISOString(),
			},
		})
	},

	notifyAboutWorldShared: ({ users }: { users: User[] }) => {
		users.forEach((user) => {
			calliope.sendMessage({
				type: RheaToCalliopeMessageType.WORLD_SHARED,
				data: {
					userId: user.id,
				},
			})
		})
	},

	notifyAboutWorldUnshared: ({ userId }: { userId: string }) => {
		calliope.sendMessage({
			type: RheaToCalliopeMessageType.WORLD_UNSHARED,
			data: {
				userId,
			},
		})
	},
}
