import { MentionedEntity, WikiArticle } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'
import { BadRequestError } from 'moonflower'

import { makeFetchArticleAncestorsQuery } from './dbQueries/makeFetchArticleAncestorsQuery.js'
import { makeSortWikiArticles as makeSortWikiArticlesQuery } from './dbQueries/makeSortWikiArticles.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { MentionData, MentionsService } from './MentionsService.js'

export const WikiService = {
	findArticleById: async ({ id, worldId }: { id: string; worldId: string }) => {
		return getPrismaClient().wikiArticle.findFirst({
			where: {
				id,
				worldId,
			},
		})
	},

	listWikiArticles: async (params: Pick<WikiArticle, 'worldId'>) => {
		const articles = await getPrismaClient().wikiArticle.findMany({
			where: {
				worldId: params.worldId,
			},
			include: {
				children: true,
			},
			omit: {
				contentYjs: true,
			},
			orderBy: {
				position: 'asc',
			},
		})

		return articles
	},

	getArticleCount: async (params: Pick<WikiArticle, 'worldId'>) => {
		return getPrismaClient().wikiArticle.count({
			where: {
				worldId: params.worldId,
			},
		})
	},

	createWikiArticle: async (params: Pick<WikiArticle, 'worldId' | 'name' | 'position'>) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const article = await prisma.wikiArticle.create({
				data: {
					worldId: params.worldId,
					name: params.name,
					position: params.position * 2,
				},
				include: {
					children: true,
				},
				omit: {
					contentYjs: true,
				},
			})

			await makeSortWikiArticlesQuery(params.worldId, prisma)
			await makeTouchWorldQuery(params.worldId, prisma)

			return article
		})
	},

	updateWikiArticle: async (
		params: Partial<Pick<WikiArticle, 'name' | 'contentRich' | 'contentYjs'>> & {
			id: string
			mentions?: MentionData[]
		},
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const mentionedEntities = await MentionsService.createMentions(
				params.id,
				MentionedEntity.Article,
				params.mentions,
				prisma,
			)

			const updatedArticle = await prisma.wikiArticle.update({
				where: {
					id: params.id,
				},
				data: {
					name: params.name,
					contentRich: params.contentRich,
					contentYjs: params.contentYjs,
					mentions: mentionedEntities
						? {
								set: mentionedEntities.map((mention) => ({
									sourceId_targetId: {
										sourceId: mention.sourceId,
										targetId: mention.targetId,
									},
								})),
							}
						: undefined,
				},
				include: {
					children: true,
				},
				omit: {
					contentYjs: true,
				},
			})

			await MentionsService.clearOrphanedMentions(prisma)
			await makeTouchWorldQuery(updatedArticle.worldId, prisma)

			return updatedArticle
		})
	},

	moveWikiArticle: async (params: {
		worldId: string
		articleId: string
		toPosition: number
		toParentId?: string | null
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const baseArticle = await prisma.wikiArticle.findFirst({
				where: { id: params.articleId },
				select: {
					id: true,
					position: true,
					parentId: true,
				},
			})

			if (!baseArticle) {
				throw new BadRequestError('Article not found')
			}

			if (params.toParentId === baseArticle.id) {
				throw new BadRequestError('Cannot move article to be its own parent')
			}

			if (params.toParentId) {
				const ancestors = await makeFetchArticleAncestorsQuery(params.worldId, params.toParentId, prisma)
				if (ancestors.includes(params.articleId)) {
					throw new BadRequestError('Cannot move article to be its own descendant')
				}
			}

			const article = await prisma.wikiArticle.update({
				where: {
					id: params.articleId,
				},
				data: {
					parentId: params.toParentId,
					position: params.toPosition,
				},
				include: {
					children: true,
				},
			})

			await makeSortWikiArticlesQuery(params.worldId, prisma)
			const world = await makeTouchWorldQuery(params.worldId, prisma)

			return { article, world }
		})
	},

	deleteWikiArticle: async ({ worldId, articleId }: { worldId: string; articleId: string }) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			await prisma.wikiArticle.delete({
				where: {
					id: articleId,
				},
			})

			await makeSortWikiArticlesQuery(worldId, prisma)
			const world = await makeTouchWorldQuery(worldId, prisma)

			return {
				world,
			}
		})
	},

	bulkDeleteWikiArticles: async ({ worldId, articles }: { worldId: string; articles: string[] }) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			await prisma.wikiArticle.deleteMany({
				where: {
					id: {
						in: articles,
					},
				},
			})

			await makeSortWikiArticlesQuery(worldId, prisma)
			const world = await makeTouchWorldQuery(worldId, prisma)

			return {
				world,
			}
		})
	},
}
