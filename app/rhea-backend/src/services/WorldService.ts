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

	issueWorldStatement: async (eventId: string, data: Pick<WorldStatement, 'title'>) => {
		return dbClient.worldStatement.create({
			data: {
				issuedByEventId: eventId,
				title: data.title,
			},
			select: {
				id: true,
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
