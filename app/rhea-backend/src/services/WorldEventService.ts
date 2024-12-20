import { Actor, WorldEvent } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { fetchWorldEventOrThrow } from './dbQueries/fetchWorldEventOrThrow'
import { CreateWorldQueryData, makeCreateWorldEventQuery } from './dbQueries/makeCreateWorldEventQuery'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { makeUpdateDeltaStateNamesQueries } from './dbQueries/makeUpdateDeltaStateNamesQueries'

export const WorldEventService = {
	fetchWorldEvent: async (eventId: string) => {
		return await fetchWorldEventOrThrow(eventId)
	},

	fetchWorldEventWithDeltaStates: async (eventId: string) => {
		const event = await getPrismaClient().worldEvent.findFirst({
			where: {
				id: eventId,
			},
			include: {
				deltaStates: true,
			},
		})
		if (!event) {
			throw new BadRequestError(`Unable to find event.`)
		}
		return event
	},

	createWorldEvent: async ({ worldId, eventData }: { worldId: string; eventData: CreateWorldQueryData }) => {
		const [event, world] = await getPrismaClient().$transaction([
			makeCreateWorldEventQuery(worldId, eventData),
			makeTouchWorldQuery(worldId),
		])
		return {
			event,
			world,
		}
	},

	updateWorldEvent: async ({
		worldId,
		eventId,
		params,
	}: {
		worldId: string
		eventId: string
		params: Partial<WorldEvent> & {
			mentionedActors: Actor[] | null
		}
	}) => {
		const eventBeforeUpdate = await WorldEventService.fetchWorldEventWithDeltaStates(eventId)

		const [event, world] = await getPrismaClient().$transaction([
			getPrismaClient().worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					...params,
					mentionedActors:
						params.mentionedActors !== null
							? {
									set: params.mentionedActors.map((actor) => ({ id: actor.id })),
								}
							: undefined,
				},
				include: {
					deltaStates: true,
					mentionedActors: true,
				},
			}),
			makeTouchWorldQuery(worldId),
			...makeUpdateDeltaStateNamesQueries({
				event: eventBeforeUpdate,
				customName: params.name,
				customNameEnabled: params.customName,
			}),
		])
		return {
			event,
			world,
		}
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
