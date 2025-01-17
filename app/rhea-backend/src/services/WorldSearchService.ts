import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'

export const WorldSearchService = {
	async findEvents(worldId: string, query: string) {
		const prisma = getPrismaClient()
		return prisma.worldEvent.findMany({
			where: {
				worldId,
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ description: { contains: query, mode: 'insensitive' } },
					{
						deltaStates: {
							some: {
								name: { contains: query, mode: 'insensitive' },
								description: { contains: query, mode: 'insensitive' },
							},
						},
					},
				],
			},
			orderBy: {
				timestamp: 'asc',
			},
			include: {
				mentionedActors: true,
				deltaStates: {
					orderBy: {
						timestamp: 'asc',
					},
				},
			},
		})
	},

	async findActors(worldId: string, query: string) {
		const prisma = getPrismaClient()
		return prisma.actor.findMany({
			where: {
				worldId,
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ title: { contains: query, mode: 'insensitive' } },
					{ description: { contains: query, mode: 'insensitive' } },
				],
			},
			include: {
				statements: {
					select: {
						id: true,
					},
				},
			},
		})
	},
}
