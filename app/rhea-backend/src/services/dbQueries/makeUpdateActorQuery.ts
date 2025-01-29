import { MentionedEntity, Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'
import { MentionData, MentionsService } from '../MentionsService'

export type UpdateActorQueryParams = Omit<
	Prisma.ActorUncheckedUpdateInput,
	'id' | 'createdAt' | 'updatedAt' | 'worldId' | 'mentions'
> & {
	mentions?: MentionData[] | undefined
}

export const makeUpdateActorQuery = async ({
	actorId,
	params,
	prisma,
}: {
	actorId: string
	params: UpdateActorQueryParams
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
