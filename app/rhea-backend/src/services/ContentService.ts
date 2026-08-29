import {
	Actor,
	ContentPage,
	MentionedEntity,
	MindmapNode,
	Prisma,
	ReferenceHoldingEntity,
	WikiArticle,
	WorldEvent,
} from '@prisma/client'
import { ContentEntityType } from '@src/schema/ContentEntityType.js'
import { BadRequestError } from 'moonflower'

import { AssetRefService } from './AssetRefService.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'
import { MentionsService } from './MentionsService.js'
import { DocumentContent } from './RichTextService.js'

type ContentEntity = Actor | WorldEvent | WikiArticle | MindmapNode

const CONFIG = {
	actor: {
		mentionType: MentionedEntity.Actor,
		holderType: ReferenceHoldingEntity.Actor,
		parentColumn: 'parentActorId' satisfies keyof ContentPage,
	},
	event: {
		mentionType: MentionedEntity.Event,
		holderType: ReferenceHoldingEntity.Event,
		parentColumn: 'parentEventId' satisfies keyof ContentPage,
	},
	article: {
		mentionType: MentionedEntity.Article,
		holderType: ReferenceHoldingEntity.Article,
		parentColumn: 'parentArticleId' satisfies keyof ContentPage,
	},
	node: {
		mentionType: MentionedEntity.Node,
		holderType: ReferenceHoldingEntity.Node,
		parentColumn: 'parentNodeId' satisfies keyof ContentPage,
	},
}

export const ContentService = {
	getContent: async ({
		entityType,
		worldId,
		entityId,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
	}) => {
		return findEntityOrThrow(entityType, worldId, entityId)
	},

	updateContent: async ({
		entityType,
		worldId,
		entityId,
		params,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
		params: DocumentContent
	}) => {
		const { mentionType, holderType } = CONFIG[entityType]
		const { mentions, referencedAssetIds, ...contentData } = params

		return getPrismaClient().$transaction(async (prisma) => {
			const previousMentions = await prisma.mention.findMany({
				where: mentionSourceColumn(entityType, entityId),
			})

			const mentionedEntities = await MentionsService.createMentions(
				worldId,
				entityId,
				mentionType,
				mentions,
				null,
				prisma,
			)
			await AssetRefService.createReferences({
				worldId,
				holderId: entityId,
				holderType,
				assets: referencedAssetIds,
				pageId: null,
				prisma,
			})

			const entity = await updateEntityContent(entityType, worldId, entityId, contentData, prisma)

			await MentionsService.clearOrphanedMentions(prisma)
			await AssetRefService.clearOrphanedReferences(prisma)
			await makeTouchWorldQuery(worldId, prisma)

			const updatedMentions = diffMentions(previousMentions, mentionedEntities ?? previousMentions)

			return { entity, updatedMentions }
		})
	},

	getPage: async ({
		entityType,
		worldId,
		entityId,
		pageId,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
		pageId: string
	}) => {
		const { mentionType, parentColumn } = CONFIG[entityType]
		const entity = await findEntity(entityType, worldId, entityId)
		if (!entity) {
			return null
		}
		return getPrismaClient().contentPage.findFirst({
			where: { id: pageId, parentType: mentionType, [parentColumn]: entityId },
		})
	},

	createPage: async ({
		entityType,
		worldId,
		entityId,
		name,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
		name: string
	}) => {
		const { mentionType, parentColumn } = CONFIG[entityType]
		return getPrismaClient().$transaction(async (prisma) => {
			const entity = await findEntityOrThrow(entityType, worldId, entityId, prisma)
			const page = await prisma.contentPage.create({
				data: { name, parentType: mentionType, [parentColumn]: entityId },
			})
			return { entity, page }
		})
	},

	updatePage: async ({
		entityType,
		worldId,
		entityId,
		pageId,
		params,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
		pageId: string
		params: DocumentContent
	}) => {
		const { mentionType, holderType, parentColumn } = CONFIG[entityType]
		const { mentions, referencedAssetIds, ...contentData } = params

		return getPrismaClient().$transaction(async (prisma) => {
			const previousMentions = await prisma.mention.findMany({
				where: { ...mentionSourceColumn(entityType, entityId), pageId },
			})

			const mentionedEntities = await MentionsService.createMentions(
				worldId,
				entityId,
				mentionType,
				mentions,
				pageId,
				prisma,
			)
			await AssetRefService.createReferences({
				worldId,
				holderId: entityId,
				holderType,
				assets: referencedAssetIds,
				pageId,
				prisma,
			})

			const page = await prisma.contentPage.update({
				where: { id: pageId, parentType: mentionType, [parentColumn]: entityId },
				data: contentData,
			})
			const entity = await findEntityOrThrow(entityType, worldId, entityId, prisma)

			await MentionsService.clearOrphanedMentions(prisma)
			await AssetRefService.clearOrphanedReferences(prisma)

			const updatedMentions = diffMentions(previousMentions, mentionedEntities ?? previousMentions)

			return { entity, page, updatedMentions }
		})
	},

	deletePage: async ({
		entityType,
		worldId,
		entityId,
		pageId,
	}: {
		entityType: ContentEntityType
		worldId: string
		entityId: string
		pageId: string
	}) => {
		const { mentionType, parentColumn } = CONFIG[entityType]
		return getPrismaClient().$transaction(async (prisma) => {
			await prisma.contentPage.delete({
				where: { id: pageId, parentType: mentionType, [parentColumn]: entityId },
			})
			const entity = await findEntityOrThrow(entityType, worldId, entityId, prisma)
			const updatedMentions = await prisma.mention.findMany({
				where: { ...mentionSourceColumn(entityType, entityId), pageId },
			})
			return { entity, updatedMentions }
		})
	},
}

async function findEntity(
	entityType: ContentEntityType,
	worldId: string,
	entityId: string,
	prisma?: Prisma.TransactionClient,
): Promise<ContentEntity | null> {
	const client = getPrismaClient(prisma)
	switch (entityType) {
		case 'actor':
			return client.actor.findUnique({ where: { id: entityId, worldId } })
		case 'event':
			return client.worldEvent.findUnique({ where: { id: entityId, worldId } })
		case 'article':
			return client.wikiArticle.findUnique({ where: { id: entityId, worldId } })
		case 'node':
			return client.mindmapNode.findUnique({ where: { id: entityId, worldId } })
	}
}

async function findEntityOrThrow(
	entityType: ContentEntityType,
	worldId: string,
	entityId: string,
	prisma?: Prisma.TransactionClient,
): Promise<ContentEntity> {
	const entity = await findEntity(entityType, worldId, entityId, prisma)
	if (!entity) {
		const label = entityType[0].toUpperCase() + entityType.slice(1)
		throw new BadRequestError(`${label} not found`)
	}
	return entity
}

async function updateEntityContent(
	entityType: ContentEntityType,
	worldId: string,
	entityId: string,
	data: { content: string; contentRich: string },
	prisma: Prisma.TransactionClient,
): Promise<ContentEntity> {
	const client = getPrismaClient(prisma)
	switch (entityType) {
		case 'actor':
			return client.actor.update({ where: { id: entityId, worldId }, data })
		case 'event':
			return client.worldEvent.update({ where: { id: entityId, worldId }, data })
		case 'article':
			return client.wikiArticle.update({ where: { id: entityId, worldId }, data })
		case 'node':
			return client.mindmapNode.update({ where: { id: entityId, worldId }, data })
	}
}

function mentionSourceColumn(entityType: ContentEntityType, entityId: string) {
	return {
		sourceActorId: entityType === 'actor' ? entityId : undefined,
		sourceEventId: entityType === 'event' ? entityId : undefined,
		sourceArticleId: entityType === 'article' ? entityId : undefined,
		sourceNodeId: entityType === 'node' ? entityId : undefined,
	}
}

function diffMentions<T extends { sourceId: string; targetId: string }>(previous: T[], current: T[]): T[] {
	return [...previous, ...current].filter((mention) => {
		return (
			!previous.some((prev) => prev.sourceId === mention.sourceId && prev.targetId === mention.targetId) ||
			!current.some((next) => next.sourceId === mention.sourceId && next.targetId === mention.targetId)
		)
	})
}
