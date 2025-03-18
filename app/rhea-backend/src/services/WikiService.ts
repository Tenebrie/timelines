import { MentionedEntity, WikiArticle } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'

import { makeSortWikiArticles as makeSortWikiArticlesQuery } from './dbQueries/makeSortWikiArticles'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery'
import { MentionData, MentionsService } from './MentionsService'

export const WikiService = {
	listWikiArticles: async (
		params: Pick<WikiArticle, 'worldId'> & { parentId: string | null | undefined },
	) => {
		return getPrismaClient().wikiArticle.findMany({
			where: {
				worldId: params.worldId,
				...(params.parentId === undefined ? {} : { parentId: params.parentId }),
			},
			include: {
				children: true,
			},
		})
	},

	getArticleCount: async (params: Pick<WikiArticle, 'worldId'>) => {
		return getPrismaClient().wikiArticle.count({
			where: {
				worldId: params.worldId,
			},
		})
	},

	createWikiArticle: async (params: Pick<WikiArticle, 'worldId' | 'name' | 'position'>) => {
		return getPrismaClient().wikiArticle.create({
			data: {
				worldId: params.worldId,
				name: params.name,
				position: params.position,
			},
			include: {
				children: true,
			},
		})
	},

	updateWikiArticle: async (
		params: Partial<Pick<WikiArticle, 'name' | 'contentRich'>> & {
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
				throw new Error('Article not found')
			}

			if (params.toParentId === baseArticle.id) {
				throw new Error('Cannot move article to be its own parent')
			}

			const article = await prisma.wikiArticle.update({
				where: {
					id: params.articleId,
				},
				data: {
					position: params.toPosition,
				},
				include: {
					children: true,
				},
			})

			const fromPosition = (() => {
				if (params.toParentId && params.toParentId !== baseArticle.parentId) {
					return undefined
				}

				return baseArticle.position
			})()

			const toPosition = params.toPosition
			const targetParentId = params.toParentId ?? baseArticle.parentId

			const selectRange = (() => {
				if (fromPosition !== undefined && toPosition > fromPosition) {
					return {
						gt: fromPosition,
						lte: toPosition,
					}
				}

				return {
					gte: toPosition,
					lt: fromPosition,
				}
			})()

			const movedSiblings = await prisma.wikiArticle.findMany({
				where: {
					parentId: targetParentId,
					position: selectRange,
					id: {
						not: params.articleId,
					},
				},
			})

			await Promise.all(
				movedSiblings.map((sibling) => {
					return prisma.wikiArticle.update({
						where: {
							id: sibling.id,
						},
						data: {
							position: sibling.position + (params.toPosition > baseArticle.position ? -1 : 1),
						},
					})
				}),
			)

			if (params.toParentId !== undefined && params.toParentId !== baseArticle.parentId) {
				await prisma.wikiArticle.update({
					where: {
						id: params.articleId,
					},
					data: {
						parentId: params.toParentId,
					},
				})
				await makeSortWikiArticlesQuery(params.worldId, prisma)
			}
			const world = await makeTouchWorldQuery(params.worldId, prisma)

			return { article, world }
		})
	},

	swapWikiArticlePositions: async (params: { worldId: string; articleIdA: string; articleIdB: string }) => {
		const [articleA, articleB] = await Promise.all([
			getPrismaClient().wikiArticle.findFirst({
				where: {
					id: params.articleIdA,
				},
				include: {
					children: true,
				},
			}),
			getPrismaClient().wikiArticle.findFirst({
				where: {
					id: params.articleIdB,
				},
				include: {
					children: true,
				},
			}),
		])

		if (!articleA || !articleB) {
			throw new Error('One of the articles does not exist')
		}

		if (articleB.position === articleA.position) {
			articleB.position += 1
		}

		const [updatedArticleA, updatedArticleB, world] = await getPrismaClient().$transaction([
			getPrismaClient().wikiArticle.update({
				where: {
					id: params.articleIdA,
				},
				data: {
					position: articleB.position,
				},
			}),
			getPrismaClient().wikiArticle.update({
				where: {
					id: params.articleIdB,
				},
				data: {
					position: articleA.position,
				},
			}),
			makeTouchWorldQuery(params.worldId),
		])
		return {
			world,
			articleA: updatedArticleA,
			articleB: updatedArticleB,
		}
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
