import { Mention, MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'

export type MentionData = Pick<Mention, 'targetId' | 'targetType'>

export const MentionsService = {
	createMentions: async (
		sourceId: string,
		sourceType: MentionedEntity,
		mentions: MentionData[] | undefined,
		transaction?: Prisma.TransactionClient,
	) => {
		if (!mentions) {
			return []
		}

		const data = mentions.map((mention) => {
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

		await (transaction ?? getPrismaClient()).mention.createMany({
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
