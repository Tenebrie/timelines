import { WorldEvent } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { fetchWorldEventDetailsOrThrow } from './dbQueries/fetchWorldEventDetailsOrThrow'
import { fetchWorldEventOrThrow } from './dbQueries/fetchWorldEventOrThrow'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { makeUpdateDeltaStateNamesQueries } from './dbQueries/makeUpdateDeltaStateNamesQueries'
import { makeUpdateWorldEventQuery } from './dbQueries/makeUpdateWorldEventQuery'
import { MentionData } from './MentionsService'

export const WorldEventService = {
	fetchWorldEvent: async (eventId: string) => {
		return await fetchWorldEventOrThrow(eventId)
	},

	fetchWorldEventWithDetails: async (eventId: string) => {
		return fetchWorldEventDetailsOrThrow(eventId)
	},

	createWorldEvent: async ({
		worldId,
		eventData,
	}: {
		worldId: string
		eventData: Pick<WorldEvent, 'name' | 'type' | 'timestamp'> &
			Parameters<typeof makeUpdateWorldEventQuery>[0]['params']
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const baseEvent = await prisma.worldEvent.create({
				data: {
					worldId,
					name: eventData.name,
					type: eventData.type,
					timestamp: eventData.timestamp,
				},
			})

			await makeUpdateWorldEventQuery({
				eventId: baseEvent.id,
				params: eventData,
			})

			const world = await makeTouchWorldQuery(worldId)

			const event = await fetchWorldEventDetailsOrThrow(baseEvent.id, prisma)

			return {
				world,
				event,
			}
		})
	},

	updateWorldEvent: async ({
		worldId,
		eventId,
		params,
	}: {
		worldId: string
		eventId: string
		params: Partial<WorldEvent> & {
			mentions: MentionData[] | undefined
		}
	}) => {
		const eventBeforeUpdate = await WorldEventService.fetchWorldEventWithDetails(eventId)

		return getPrismaClient().$transaction(async (prisma) => {
			await makeUpdateWorldEventQuery({
				eventId,
				params,
				prisma,
			})

			await makeUpdateDeltaStateNamesQueries({
				event: eventBeforeUpdate,
				customName: params.name,
				customNameEnabled: params.customName,
			})

			const world = await makeTouchWorldQuery(worldId, prisma)
			const event = await fetchWorldEventDetailsOrThrow(eventId, prisma)

			return {
				world,
				event,
			}
		})
	},

	deleteWorldEvent: async ({ worldId, eventId }: { worldId: string; eventId: string }) => {
		const [event, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.delete({
				where: {
					id: eventId,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			event,
			world,
		}
	},

	revokeWorldEvent: async ({
		worldId,
		eventId,
		revokedAt,
	}: {
		worldId: string
		eventId: string
		revokedAt: bigint
	}) => {
		const event = await getPrismaClient().worldEvent.findFirstOrThrow({
			where: {
				id: eventId,
			},
			select: {
				extraFields: true,
			},
		})
		const [statement, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					revokedAt,
					extraFields: event.extraFields,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			statement,
			world,
		}
	},

	unrevokeWorldEvent: async ({ worldId, eventId }: { worldId: string; eventId: string }) => {
		const [statement, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					revokedAt: null,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			statement,
			world,
		}
	},
}
