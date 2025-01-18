import { WikiArticle } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'

export const WikiService = {
	listWikiArticles: async (params: Pick<WikiArticle, 'worldId'>) => {
		return getPrismaClient().wikiArticle.findMany({
			where: {
				worldId: params.worldId,
			},
			select: {
				id: true,
				name: true,
				contentRich: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	},

	createWikiArticle: async (params: Pick<WikiArticle, 'worldId' | 'name'>) => {
		return getPrismaClient().wikiArticle.create({
			data: {
				worldId: params.worldId,
				name: params.name,
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	},

	updateWikiArticle: async (
		params: Partial<
			Pick<WikiArticle, 'id' | 'worldId' | 'name' | 'contentRich'> & {
				mentionedActors: string[]
				mentionedEvents: string[]
				mentionedTags: string[]
			}
		>,
	) => {
		return getPrismaClient().wikiArticle.update({
			where: {
				id: params.id,
			},
			data: {
				name: params.name,
				contentRich: params.contentRich,
				mentionedActors: {
					connect: params.mentionedActors?.map((id) => ({ id })),
				},
				mentionedEvents: {
					connect: params.mentionedEvents?.map((id) => ({ id })),
				},
				mentionedTags: {
					connect: params.mentionedTags?.map((id) => ({ id })),
				},
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	},
}
