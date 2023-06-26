import { Actor, User, WorldCalendarType, WorldEvent } from '@prisma/client'
import { UnauthorizedError } from 'tenebrie-framework'

import { dbClient } from './DatabaseClient'

export const touchWorld = (worldId: string) =>
	dbClient.world.update({
		where: {
			id: worldId,
		},
		data: {
			id: worldId,
		},
		select: {
			id: true,
			updatedAt: true,
		},
	})

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

	createWorldEvent: async (
		worldId: string,
		data: Pick<WorldEvent, 'type' | 'name' | 'description' | 'timestamp' | 'revokedAt'> & {
			targetActors: Actor[]
			mentionedActors: Actor[]
		}
	) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldEvent.create({
				data: {
					worldId,
					type: data.type,
					name: data.name,
					description: data.description,
					timestamp: data.timestamp,
					revokedAt: data.revokedAt,
					targetActors: {
						connect: data.targetActors.map((actor) => ({ id: actor.id })),
					},
					mentionedActors: {
						connect: data.mentionedActors.map((actor) => ({ id: actor.id })),
					},
				},
				select: {
					id: true,
				},
			}),
			touchWorld(worldId),
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
		params: Partial<WorldEvent> & { targetActors: Actor[] | null; mentionedActors: Actor[] | null }
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
					targetActors: true,
					mentionedActors: true,
				},
			}),
			touchWorld(worldId),
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
			touchWorld(worldId),
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
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
				where: {
					id: eventId,
				},
				data: {
					revokedAt,
				},
			}),
			touchWorld(worldId),
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
			touchWorld(worldId),
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
							include: {
								targetActors: true,
								mentionedActors: true,
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
					},
				},
			},
		})
	},
}
