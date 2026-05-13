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
	eventId,
	params,
	prisma,
}: {
	eventId: string
	params: UpdateWorldEventQueryParams
	prisma?: Prisma.TransactionClient
}) => {
	const { referencedAssetIds, ...eventData } = params

	const mentionedEntities = await MentionsService.createMentions(
		eventId,
		MentionedEntity.Event,
		eventData.mentions,
		prisma,
	)
	const referencedAssets = await AssetRefService.createReferences(
		eventId,
		ReferenceHoldingEntity.Event,
		referencedAssetIds,
		prisma,
	)

	const event = await getPrismaClient(prisma).worldEvent.update({
		where: {
			id: eventId,
		},
		data: {
			...eventData,
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
			assetRefs: referencedAssets
				? {
						set: referencedAssets.map((ref) => ({
							assetId_holderId: {
								assetId: ref.assetId,
								holderId: ref.holderId,
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
	await AssetRefService.clearOrphanedReferences(prisma)

	return event
}
