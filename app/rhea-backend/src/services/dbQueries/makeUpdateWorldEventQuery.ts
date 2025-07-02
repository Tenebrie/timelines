import { MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'
import { MentionData, MentionsService } from '../MentionsService.js'

export type UpdateWorldEventQueryParams = Omit<
	Prisma.WorldEventUncheckedUpdateInput,
	'id' | 'createdAt' | 'updatedAt' | 'worldId' | 'mentions'
> & {
	mentions?: MentionData[] | undefined
}

export const makeUpdateWorldEventQuery = async ({
	eventId,
	params,
	prisma,
}: {
	eventId: string
	params: UpdateWorldEventQueryParams
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
