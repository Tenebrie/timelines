import { Actor, WorldEvent, WorldEventField } from '@prisma/client'
import { BadRequestError } from 'tenebrie-framework'

import { dbClient } from './DatabaseClient'
import { fetchWorldEventOrThrow } from './dbQueries/fetchWorldEventOrThrow'
import { CreateWorldQueryData, makeCreateWorldEventQuery } from './dbQueries/makeCreateWorldEventQuery'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'

export const WorldEventService = {
	fetchWorldEvent: async (eventId: string, include: Parameters<typeof fetchWorldEventOrThrow>[1] = {}) => {
		return await fetchWorldEventOrThrow(eventId, include)
	},

	fetchWorldEventWithDeltaStates: async (eventId: string) => {
		const event = await dbClient.worldEvent.findFirst({
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
		const [event, world] = await dbClient.$transaction([
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
			targetActors: Actor[] | null
			mentionedActors: Actor[] | null
		}
	}) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					...params,
					targetActors:
						params.targetActors !== null
							? {
									set: params.targetActors.map((actor) => ({ id: actor.id })),
							  }
							: undefined,
					mentionedActors:
						params.mentionedActors !== null
							? {
									set: params.mentionedActors.map((actor) => ({ id: actor.id })),
							  }
							: undefined,
				},
				include: {
					deltaStates: true,
					targetActors: true,
					mentionedActors: true,
				},
			}),
			makeTouchWorldQuery(worldId),
		])
		return {
			event,
			world,
		}
	},

	deleteWorldEvent: async ({ worldId, eventId }: { worldId: string; eventId: string }) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldEvent.delete({
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
		const event = await dbClient.worldEvent.findFirstOrThrow({
			where: {
				id: eventId,
			},
			select: {
				extraFields: true,
			},
		})
		const updatedModules: WorldEventField[] = event.extraFields.includes('RevokedAt')
			? event.extraFields
			: [...event.extraFields, 'RevokedAt']
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					revokedAt,
					extraFields: updatedModules,
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
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
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
