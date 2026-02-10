import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'

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
					{
						pages: {
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
				mentions: true,
				mentionedIn: true,
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
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
					{
						pages: {
							some: {
								name: { contains: query, mode: 'insensitive' },
								description: { contains: query, mode: 'insensitive' },
							},
						},
					},
				],
			},
			include: {
				mentions: true,
				mentionedIn: true,
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
	},

	async findArticles(worldId: string, query: string) {
		const prisma = getPrismaClient()
		return prisma.wikiArticle.findMany({
			where: {
				worldId,
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ contentRich: { contains: query, mode: 'insensitive' } },
					{
						pages: {
							some: {
								name: { contains: query, mode: 'insensitive' },
								description: { contains: query, mode: 'insensitive' },
							},
						},
					},
				],
			},
			include: {
				mentions: true,
				mentionedIn: true,
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
	},

	async findTags(worldId: string, query: string) {
		const prisma = getPrismaClient()
		return prisma.tag.findMany({
			where: {
				worldId,
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ description: { contains: query, mode: 'insensitive' } },
				],
			},
			include: {
				mentions: true,
				mentionedIn: true,
			},
		})
	},
}
