import { MentionedEntity, Prisma, ReferenceHoldingEntity } from '@prisma/client'

import { AssetRefService } from '../AssetRefService.js'
import { getPrismaClient } from '../dbClients/DatabaseClient.js'
import { MentionData, MentionsService } from '../MentionsService.js'

export type UpdateWorldEventQueryParams = Omit<
	Prisma.WorldEventUncheckedUpdateInput,
	'id' | 'createdAt' | 'updatedAt' | 'worldId' | 'mentions'
> & {
	mentions?: MentionData[] | undefined
	referencedAssetIds?: string[] | undefined
}

export const makeUpdateWorldEventQuery = async ({
	worldId,
	eventId,
	params,
	prisma,
}: {
	worldId: string
	eventId: string
	params: UpdateWorldEventQueryParams
	prisma?: Prisma.TransactionClient
}) => {
	const { referencedAssetIds, mentions, ...eventData } = params

	await MentionsService.createMentions(eventId, MentionedEntity.Event, mentions, null, prisma)
	await AssetRefService.createReferences({
		worldId,
		holderId: eventId,
		holderType: ReferenceHoldingEntity.Event,
		assets: referencedAssetIds,
		pageId: null,
		prisma,
	})

	const event = await getPrismaClient(prisma).worldEvent.update({
		where: {
			id: eventId,
			worldId,
		},
		data: {
			...eventData,
		},
		include: {
			mentions: { distinct: ['targetId'] },
			mentionedIn: { distinct: ['sourceId'] },
		},
	})

	await MentionsService.clearOrphanedMentions(prisma)
	await AssetRefService.clearOrphanedReferences(prisma)

	return event
}
