import { Actor, User, WorldCalendarType, WorldEvent, WorldEventField } from '@prisma/client'
import { BadRequestError, UnauthorizedError } from 'tenebrie-framework'

import { dbClient } from './DatabaseClient'
import { fetchWorldEventOrThrow } from './dbQueries/fetchWorldEventOrThrow'
import { CreateWorldQueryData, makeCreateWorldEventQuery } from './dbQueries/makeCreateWorldEventQuery'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { makeUnrevokeWorldEventQuery } from './dbQueries/makeUnrevokeWorldEventQuery'

export const WorldService = {
	checkUserReadAccess: async (user: User, worldId: string) => {
		await WorldService.checkUserWriteAccess(user, worldId)
	},

	checkUserWriteAccess: async (user: User, worldId: string) => {
		const count = await dbClient.world.count({
			where: {
				id: worldId,
				owner: user,
			},
		})
		if (count === 0) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkEventValidity: async (eventId: string) => {
		const count = await dbClient.worldEvent.count({
			where: {
				id: eventId,
			},
		})
		if (count === 0) {
			throw new BadRequestError('Event does not exist')
		}
	},

	createWorld: async (params: {
		owner: User
		name: string
		calendar?: WorldCalendarType
		timeOrigin?: number
	}) => {
		return dbClient.world.create({
			data: {
				name: params.name,
				ownerId: params.owner.id,
				calendar: params.calendar,
				timeOrigin: params.timeOrigin,
			},
			select: {
				id: true,
				name: true,
			},
		})
	},

	deleteWorld: async (worldId: string) => {
		return dbClient.world.delete({
			where: {
				id: worldId,
			},
		})
	},

	createWorldEvent: async ({
		worldId,
		eventData,
	}: {
		worldId: string
		eventData: Omit<CreateWorldQueryData, 'replacedByEventId'>
	}) => {
		const replacedEventId = eventData.replacedEventId
		if (replacedEventId) {
			return WorldService.createWorldEventAsReplace({
				worldId,
				eventData: {
					...eventData,
					replacedEventId,
				},
			})
		} else {
			return WorldService.createWorldEventAsNew({
				worldId,
				eventData: {
					...eventData,
					replacedEventId: null,
				},
			})
		}
	},

	createWorldEventAsNew: async ({
		worldId,
		eventData,
	}: {
		worldId: string
		eventData: Omit<CreateWorldQueryData, 'replacedEventId'> & {
			replacedEventId: null
		}
	}) => {
		const [event, world] = await dbClient.$transaction([
			makeCreateWorldEventQuery(worldId, eventData),
			makeTouchWorldQuery(worldId),
		])
		return {
			event,
			world,
		}
	},

	createWorldEventAsReplace: async ({
		worldId,
		eventData,
	}: {
		worldId: string
		eventData: Omit<CreateWorldQueryData, 'replacedEventId'> & {
			replacedEventId: NonNullable<WorldEvent['replacedEventId']>
		}
	}) => {
		const replacedEvent = await fetchWorldEventOrThrow(eventData.replacedEventId)
		const modifiedEventData: typeof eventData = {
			...eventData,
			revokedAt: replacedEvent.revokedAt ?? eventData.revokedAt,
			replacedByEventId: replacedEvent.replacedByEventId,
		}
		const [, , event, , world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
				where: {
					id: eventData.replacedEventId,
				},
				data: {
					replacedByEventId: null,
				},
			}),
			dbClient.worldEvent.update({
				where: {
					id: replacedEvent.replacedByEventId ?? undefined,
				},
				data: {
					replacedEventId: null,
				},
			}),
			makeCreateWorldEventQuery(worldId, modifiedEventData),
			makeUnrevokeWorldEventQuery({ event: replacedEvent }),
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
		params: Omit<Partial<WorldEvent>, 'replacedByEventId'> & {
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
					replacedEventId: params.replacedEventId
						? {
								set: params.replacedEventId,
						  }
						: params.replacedEventId,
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
					replaces: {
						select: {
							id: true,
							name: true,
							timestamp: true,
						},
					},
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

	listOwnedWorlds: async (params: { owner: User }) => {
		return dbClient.world.findMany({
			where: {
				owner: params.owner,
			},
		})
	},

	findWorldDetails: async (worldId: string) => {
		return dbClient.world.findFirstOrThrow({
			where: {
				id: worldId,
			},
			include: {
				actors: {
					include: {
						statements: {
							select: {
								id: true,
							},
						},
						relationships: true,
						receivedRelationships: true,
					},
				},
				events: {
					include: {
						targetActors: true,
						mentionedActors: true,
						introducedActors: true,
						terminatedActors: true,
						replaces: {
							select: {
								id: true,
								name: true,
								timestamp: true,
							},
						},
						replacedBy: {
							select: {
								id: true,
								name: true,
								timestamp: true,
							},
						},
					},
				},
			},
		})
	},
}
