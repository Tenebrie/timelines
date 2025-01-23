import { MentionedEntity, Prisma, WorldEvent } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'
import { MentionData, MentionsService } from '../MentionsService'

export const makeUpdateWorldEventQuery = async ({
	eventId,
	params,
	prisma,
}: {
	eventId: string
	params: Partial<WorldEvent> & {
		mentions?: MentionData[] | undefined
	}
	prisma?: Prisma.TransactionClient
}) => {
	const mentionedEntities = await MentionsService.createMentions(
		eventId,
		MentionedEntity.Event,
		params.mentions,
		prisma,
	)

	const event = await getPrismaClient(prisma).worldEvent.update({
		where: {
			id: eventId,
		},
		data: {
			...params,
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
			mentions: true,
			mentionedIn: true,
		},
	})

	await MentionsService.clearOrphanedMentions(prisma)

	return event
}
