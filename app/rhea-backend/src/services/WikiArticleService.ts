import { MentionedEntity, ReferenceHoldingEntity, WikiArticle } from '@prisma/client'
import { WikiEntityType } from '@src/schema/EntityType.js'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'
import { BadRequestError } from 'moonflower'

import { AssetRefService } from './AssetRefService.js'
import { makeFetchArticleAncestorsQuery } from './dbQueries/makeFetchArticleAncestorsQuery.js'
import { makeSortWikiArticlesQuery as makeSortWikiArticlesQuery } from './dbQueries/makeSortWikiArticlesQuery.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { MentionData, MentionsService } from './MentionsService.js'
import { MentionedByEntry } from './TagService.js'
import { BulkActionService } from './WorldBulkActionService.js'

export const WikiArticleService = {
	findArticleById: async ({ id, worldId }: { id: string; worldId: string }) => {
		return getPrismaClient().wikiArticle.findFirst({
			where: {
				id,
				worldId,
			},
			include: {
				mentions: {
					distinct: ['targetId'],
					select: {
						targetId: true,
						targetType: true,
					},
				},
				mentionedIn: {
					distinct: ['sourceId'],
					select: {
						sourceId: true,
						sourceType: true,
					},
				},
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})
	},

	findArticleByIdOrThrow: async ({ id, worldId }: { id: string; worldId: string }) => {
		const article = await WikiArticleService.findArticleById({ id, worldId })
		if (!article) {
			throw new BadRequestError('Article not found')
		}
		return article
	},

	findArticleByIdWithContentDeltas: async ({ id, worldId }: { id: string; worldId: string }) => {
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
				pages: {
					select: {
						id: true,
						name: true,
					},
				},
				mentions: {
					distinct: ['targetId'],
					select: {
						targetId: true,
						targetType: true,
					},
				},
				mentionedIn: {
					distinct: ['sourceId'],
					select: {
						sourceId: true,
						sourceType: true,
					},
				},
			},
			orderBy: {
				parentFolderPosition: 'asc',
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

	createWikiArticle: async (
		params: Pick<WikiArticle, 'worldId' | 'name' | 'contentRich'> & {
			icon?: string
			color?: string
			mentions?: MentionData[]
		},
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const entityCount = await BulkActionService.countWikiEntities({ worldId: params.worldId, prisma })

			const baseArticle = await prisma.wikiArticle.create({
				data: {
					worldId: params.worldId,
					name: params.name,
					icon: params.icon,
					color: params.color,
					contentRich: params.contentRich,
					parentFolderPosition: entityCount * 2,
				},
				select: {
					id: true,
				},
			})

			await MentionsService.createMentions(
				params.worldId,
				baseArticle.id,
				MentionedEntity.Article,
				params.mentions,
				null,
				prisma,
			)

			await makeSortWikiArticlesQuery(params.worldId, prisma)
			await makeTouchWorldQuery(params.worldId, prisma)

			const article = await prisma.wikiArticle.findFirst({
				where: {
					id: baseArticle.id,
				},
			})

			return article!
		})
	},

	updateWikiArticle: async (
		params: Partial<Pick<WikiArticle, 'name' | 'contentRich'>> & {
			id: string
			color?: string
			worldId: string
			mentions?: MentionData[]
			referencedAssetIds?: string[]
		},
	) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const previousMentions = await prisma.mention.findMany({
				where: {
					sourceArticleId: params.id,
				},
			})

			const mentionedEntities = await MentionsService.createMentions(
				params.worldId,
				params.id,
				MentionedEntity.Article,
				params.mentions,
				null,
				prisma,
			)
			await AssetRefService.createReferences({
				worldId: params.worldId,
				holderId: params.id,
				holderType: ReferenceHoldingEntity.Article,
				assets: params.referencedAssetIds,
				pageId: null,
				prisma,
			})

			const updatedArticle = await prisma.wikiArticle.update({
				where: {
					id: params.id,
					worldId: params.worldId,
				},
				data: {
					name: params.name,
					color: params.color,
					contentRich: params.contentRich,
				},
			})

			// When mentions weren't touched (mentionedEntities is undefined) nothing changed.
			const reconciledMentions = mentionedEntities ?? previousMentions
			const updatedMentions = [...previousMentions, ...reconciledMentions].filter((mention) => {
				return (
					!previousMentions.some(
						(prev) => prev.sourceId === mention.sourceId && prev.targetId === mention.targetId,
					) ||
					!reconciledMentions.some(
						(updated) => updated.sourceId === mention.sourceId && updated.targetId === mention.targetId,
					)
				)
			})

			await MentionsService.clearOrphanedMentions(prisma)
			await AssetRefService.clearOrphanedReferences(prisma)
			await makeTouchWorldQuery(updatedArticle.worldId, prisma)

			return { article: updatedArticle, updatedMentions }
		})
	},

	moveWikiArticle: async (params: {
		worldId: string
		entityId: string
		entityType: WikiEntityType
		toPosition: number
		toParentId?: string | null
	}) => {
		return getPrismaClient().$transaction(async (prisma) => {
			const baseEntity = await (async () => {
				const findParams = {
					where: { id: params.entityId },
					select: {
						id: true,
						parentFolderId: true,
					},
				}

				if (params.entityType === 'actor') {
					return prisma.actor.findFirst(findParams)
				}
				if (params.entityType === 'article') {
					return prisma.wikiArticle.findFirst(findParams)
				}
				if (params.entityType === 'folder') {
					return prisma.wikiFolder.findFirst(findParams)
				}
				if (params.entityType === 'event') {
					return prisma.worldEvent.findFirst(findParams)
				}
				if (params.entityType === 'tag') {
					return prisma.tag.findFirst(findParams)
				}
				throw new BadRequestError('Unsupported entity type')
			})()

			if (!baseEntity) {
				throw new BadRequestError('Article not found')
			}

			if (params.toParentId === baseEntity.id) {
				throw new BadRequestError('Cannot move article to be its own parent')
			}

			if (params.toParentId && params.entityType === 'folder') {
				const ancestors = await makeFetchArticleAncestorsQuery(params.worldId, params.toParentId, prisma)
				if (ancestors.includes(params.entityId)) {
					throw new BadRequestError('Cannot move article to be its own descendant')
				}
			}

			const updateParams = {
				where: {
					id: params.entityId,
				},
				data: {
					parentFolderId: params.toParentId,
					parentFolderPosition: params.toPosition,
				},
			}

			if (params.entityType === 'actor') {
				await prisma.actor.update(updateParams)
			} else if (params.entityType === 'article') {
				await prisma.wikiArticle.update(updateParams)
			} else if (params.entityType === 'folder') {
				await prisma.wikiFolder.update(updateParams)
			} else if (params.entityType === 'event') {
				await prisma.worldEvent.update(updateParams)
			} else if (params.entityType === 'tag') {
				await prisma.tag.update(updateParams)
			}

			const updates = await makeSortWikiArticlesQuery(params.worldId, prisma)
			const world = await makeTouchWorldQuery(params.worldId, prisma)

			return { world, updates }
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

			const updatedMentions = await prisma.mention.findMany({
				where: {
					sourceArticleId: articleId,
				},
			})

			return {
				world,
				updatedMentions,
			}
		})
	},

	findArticleBacklinks: async ({ worldId, articleId }: { worldId: string; articleId: string }) => {
		const article = await getPrismaClient().wikiArticle.findFirst({
			where: { id: articleId, worldId },
			include: {
				mentionedIn: {
					distinct: ['sourceId'],
					include: {
						sourceActor: {
							select: { id: true, name: true },
						},
						sourceEvent: {
							select: { id: true, name: true },
						},
						sourceArticle: {
							select: { id: true, name: true },
						},
						sourceTag: {
							select: { id: true, name: true },
						},
					},
				},
			},
		})

		if (!article) {
			return null
		}

		const mentionedBy: MentionedByEntry[] = article.mentionedIn.map((mention) => {
			const source = mention.sourceActor ?? mention.sourceEvent ?? mention.sourceArticle ?? mention.sourceTag
			return {
				type: mention.sourceType,
				id: source?.id ?? mention.sourceId,
				name: source?.name ?? 'Unknown',
			}
		})

		return mentionedBy
	},
}
