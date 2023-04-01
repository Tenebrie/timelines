import { User, WorldEvent, WorldStatement } from '@prisma/client'
import { UnauthorizedError } from 'tenebrie-framework'

import { dbClient } from './DatabaseClient'

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

	createWorld: async (params: { owner: User; name: string }) => {
		return dbClient.world.create({
			data: {
				name: params.name,
				ownerId: params.owner.id,
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
		return dbClient.worldEvent.create({
			data: {
				worldId,
				name: data.name,
				type: data.type,
				timestamp: data.timestamp,
			},
			select: {
				id: true,
			},
		})
	},

	deleteWorldEvent: async (eventId: string) => {
		return dbClient.worldEvent.delete({
			where: {
				id: eventId,
			},
		})
	},

	issueWorldStatement: async (
		data: Pick<WorldStatement, 'title'> & { eventId: string; content?: string }
	) => {
		return dbClient.worldStatement.create({
			data: {
				issuedByEventId: data.eventId,
				title: data.title,
				text: data.content,
			},
			select: {
				id: true,
			},
		})
	},

	deleteWorldStatement: async (statementId: string) => {
		return dbClient.worldStatement.delete({
			where: {
				id: statementId,
			},
		})
	},

	revokeWorldStatement: async ({ statementId, eventId }: { statementId: string; eventId: string }) => {
		return dbClient.worldStatement.update({
			where: {
				id: statementId,
			},
			data: {
				revokedByEventId: eventId,
			},
		})
	},

	unrevokeWorldStatement: async ({ statementId }: { statementId: string }) => {
		return dbClient.worldStatement.update({
			where: {
				id: statementId,
			},
			data: {
				revokedByEventId: null,
			},
		})
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
