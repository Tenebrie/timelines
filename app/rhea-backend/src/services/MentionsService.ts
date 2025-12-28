import { Mention, MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export type MentionData = Pick<Mention, 'targetId' | 'targetType'>

export const MentionsService = {
	createMentions: async (
		sourceId: string,
		sourceType: MentionedEntity,
		mentions: MentionData[] | undefined,
		prisma?: Prisma.TransactionClient,
	) => {
		if (!mentions) {
			return []
		}

		const mentionedActorIds = mentions.map((mention) => mention.targetId)
		const mentionedActors = await getPrismaClient(prisma).actor.findMany({
			where: {
				id: {
					in: mentionedActorIds,
				},
			},
			select: {
				id: true,
			},
		})
		const validMentions = mentions.filter((mention) =>
			mentionedActors.some((actor) => actor.id === mention.targetId),
		)

		const data = validMentions.map((mention) => {
			return {
				sourceId: sourceId,
				sourceType: sourceType,

				targetId: mention.targetId,
				targetType: mention.targetType,

				sourceActorId: sourceType === MentionedEntity.Actor ? sourceId : undefined,
				sourceEventId: sourceType === MentionedEntity.Event ? sourceId : undefined,
				sourceArticleId: sourceType === MentionedEntity.Article ? sourceId : undefined,
				sourceTagId: sourceType === MentionedEntity.Tag ? sourceId : undefined,

				targetActorId: mention.targetType === MentionedEntity.Actor ? mention.targetId : undefined,
				targetEventId: mention.targetType === MentionedEntity.Event ? mention.targetId : undefined,
				targetArticleId: mention.targetType === MentionedEntity.Article ? mention.targetId : undefined,
				targetTagId: mention.targetType === MentionedEntity.Tag ? mention.targetId : undefined,
			}
		})

		await getPrismaClient(prisma).mention.createMany({
			data,
			skipDuplicates: true,
		})

		return data as Mention[]
	},

	clearOrphanedMentions: async (transaction?: Prisma.TransactionClient) => {
		await (transaction ?? getPrismaClient()).mention.deleteMany({
			where: {
				OR: [
					{ sourceArticleId: null, sourceEventId: null, sourceTagId: null, sourceActorId: null },
					{ targetArticleId: null, targetEventId: null, targetTagId: null, targetActorId: null },
				],
			},
		})
	},
}
