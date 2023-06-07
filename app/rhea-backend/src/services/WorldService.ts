import { Actor, User, WorldCalendarType, WorldEvent, WorldStatement } from '@prisma/client'
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

	createWorldEvent: async (worldId: string, data: Pick<WorldEvent, 'name' | 'type' | 'timestamp'>) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldEvent.create({
				data: {
					worldId,
					name: data.name,
					type: data.type,
					timestamp: data.timestamp,
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
		params: Partial<WorldEvent>
	}) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldEvent.update({
				where: {
					id: eventId,
				},
				data: params,
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

	issueWorldStatement: async (
		data: Pick<WorldStatement, 'content'> &
			Partial<Pick<WorldStatement, 'title'>> & { worldId: string; eventId: string; relatedActors: Actor[] }
	) => {
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldStatement.create({
				data: {
					issuedByEventId: data.eventId,
					title: data.title,
					content: data.content,
					relatedActors: {
						connect: data.relatedActors.map((actor) => ({ id: actor.id })),
					},
				},
			}),
			touchWorld(data.worldId),
		])
		return {
			statement,
			world,
		}
	},

	updateWorldStatement: async ({
		worldId,
		statementId,
		params,
	}: {
		worldId: string
		statementId: string
		params: Partial<WorldStatement>
	}) => {
		const [event, world] = await dbClient.$transaction([
			dbClient.worldStatement.update({
				where: {
					id: statementId,
				},
				data: params,
			}),
			touchWorld(worldId),
		])
		return {
			event,
			world,
		}
	},

	deleteWorldStatement: async ({ worldId, statementId }: { worldId: string; statementId: string }) => {
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldStatement.delete({
				where: {
					id: statementId,
				},
			}),
			touchWorld(worldId),
		])
		return {
			statement,
			world,
		}
	},

	revokeWorldStatement: async ({
		worldId,
		eventId,
		statementId,
	}: {
		worldId: string
		eventId: string
		statementId: string
	}) => {
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldStatement.update({
				where: {
					id: statementId,
				},
				data: {
					revokedByEventId: eventId,
				},
			}),
			touchWorld(worldId),
		])
		return {
			statement,
			world,
		}
	},

	unrevokeWorldStatement: async ({ worldId, statementId }: { worldId: string; statementId: string }) => {
		const [statement, world] = await dbClient.$transaction([
			dbClient.worldStatement.update({
				where: {
					id: statementId,
				},
				data: {
					revokedByEventId: null,
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
						statements: true,
						relationships: true,
						receivedRelationships: true,
					},
				},
				events: {
					include: {
						issuedStatements: true,
						revokedStatements: true,
					},
				},
			},
		})
	},
}
