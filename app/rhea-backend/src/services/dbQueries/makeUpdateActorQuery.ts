import { MentionedEntity, Prisma, ReferenceHoldingEntity } from '@prisma/client'

import { AssetRefService } from '../AssetRefService.js'
import { getPrismaClient } from '../dbClients/DatabaseClient.js'
import { MentionData, MentionsService } from '../MentionsService.js'

export type UpdateActorQueryParams = Omit<
	Prisma.ActorUncheckedUpdateInput,
	'id' | 'createdAt' | 'updatedAt' | 'worldId' | 'mentions'
> & {
	mentions?: MentionData[] | undefined
	referencedAssetIds?: string[] | undefined
}

export const makeUpdateActorQuery = async ({
	worldId,
	actorId,
	params,
	prisma,
}: {
	worldId: string
	actorId: string
	params: UpdateActorQueryParams
	prisma?: Prisma.TransactionClient
}) => {
	const previousMentions = await getPrismaClient(prisma).mention.findMany({
		where: {
			sourceActorId: actorId,
		},
	})

	const { referencedAssetIds, ...actorData } = params

	const mentionedEntities = await MentionsService.createMentions(
		actorId,
		MentionedEntity.Actor,
		actorData.mentions,
		prisma,
	)
	const referencedAssets = await AssetRefService.createReferences({
		worldId,
		holderId: actorId,
		holderType: ReferenceHoldingEntity.Actor,
		assets: referencedAssetIds,
		prisma,
	})

	const actor = await getPrismaClient(prisma).actor.update({
		where: {
			id: actorId,
		},
		data: {
			...actorData,
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
			pages: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		omit: {
			descriptionYjs: true,
		},
	})

	await MentionsService.clearOrphanedMentions(prisma)
	await AssetRefService.clearOrphanedReferences(prisma)

	const updatedMentions = [...previousMentions, ...mentionedEntities].filter((mention) => {
		return (
			!previousMentions.some(
				(prev) => prev.sourceId === mention.sourceId && prev.targetId === mention.targetId,
			) ||
			!mentionedEntities.some(
				(updated) => updated.sourceId === mention.sourceId && updated.targetId === mention.targetId,
			)
		)
	})

	return { actor, updatedMentions }
}
