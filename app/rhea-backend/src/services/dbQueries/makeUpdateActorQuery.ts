import { Actor, MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'
import { MentionData, MentionsService } from '../MentionsService'

export const makeUpdateActorQuery = async ({
	actorId,
	params,
	prisma,
}: {
	actorId: string
	params: Partial<Actor> & {
		mentions?: MentionData[] | undefined
	}
	prisma?: Prisma.TransactionClient
}) => {
	const mentionedEntities = await MentionsService.createMentions(
		actorId,
		MentionedEntity.Actor,
		params.mentions,
		prisma,
	)

	const event = await getPrismaClient(prisma).actor.update({
		where: {
			id: actorId,
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
