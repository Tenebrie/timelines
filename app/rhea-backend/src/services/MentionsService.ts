import { Mention, MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export type MentionData = Pick<Mention, 'targetId' | 'targetType'>

export function dedupeMentions<T extends Pick<Mention, 'sourceId' | 'targetId'>>(mentions: T[]): T[] {
	const unique = new Map<string, T>()
	for (const mention of mentions) {
		unique.set(`${mention.sourceId}->${mention.targetId}`, mention)
	}
	return Array.from(unique.values())
}

export const MentionsService = {
	createMentions: async (
		sourceId: string,
		sourceType: MentionedEntity,
		mentions: MentionData[] | undefined,
		pageId: string | null,
		prisma?: Prisma.TransactionClient,
	): Promise<Mention[] | undefined> => {
		if (!mentions) {
			return undefined
		}

		const client = getPrismaClient(prisma)

		const sourceColumn = {
			sourceActorId: sourceType === MentionedEntity.Actor ? sourceId : undefined,
			sourceEventId: sourceType === MentionedEntity.Event ? sourceId : undefined,
			sourceArticleId: sourceType === MentionedEntity.Article ? sourceId : undefined,
			sourceTagId: sourceType === MentionedEntity.Tag ? sourceId : undefined,
		}

		const data = dedupeMentions(
			mentions.map((mention) => ({
				sourceId: sourceId,
				sourceType: sourceType,

				targetId: mention.targetId,
				targetType: mention.targetType,

				pageId: pageId,

				...sourceColumn,

				targetActorId: mention.targetType === MentionedEntity.Actor ? mention.targetId : undefined,
				targetEventId: mention.targetType === MentionedEntity.Event ? mention.targetId : undefined,
				targetArticleId: mention.targetType === MentionedEntity.Article ? mention.targetId : undefined,
				targetTagId: mention.targetType === MentionedEntity.Tag ? mention.targetId : undefined,
			})),
		)

		await client.mention.deleteMany({
			where: {
				...sourceColumn,
				pageId,
			},
		})

		if (data.length > 0) {
			await client.mention.createMany({
				data,
				skipDuplicates: true,
			})
		}

		const allMentions = await client.mention.findMany({
			where: sourceColumn,
		})

		return dedupeMentions(allMentions)
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
