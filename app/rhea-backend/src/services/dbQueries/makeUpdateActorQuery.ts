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

	const { referencedAssetIds, mentions, ...actorData } = params

	const mentionedEntities = await MentionsService.createMentions(
		actorId,
		MentionedEntity.Actor,
		mentions,
		null,
		prisma,
	)
	await AssetRefService.createReferences({
		worldId,
		holderId: actorId,
		holderType: ReferenceHoldingEntity.Actor,
		assets: referencedAssetIds,
		pageId: null,
		prisma,
	})

	const actor = await getPrismaClient(prisma).actor.update({
		where: {
			id: actorId,
		},
		data: {
			...actorData,
		},
		include: {
			mentions: { distinct: ['targetId'] },
			mentionedIn: { distinct: ['sourceId'] },
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

	const reconciledMentions = mentionedEntities ?? previousMentions
	const updatedMentions = [...previousMentions, ...reconciledMentions].filter((mention) => {
		return (
			!previousMentions.some(
				(prev) => prev.sourceId === mention.sourceId && prev.targetId === mention.targetId,
			) ||
			!reconciledMentions.some(
				(updated) => updated.sourceId === mention.sourceId && updated.targetId === mention.targetId,
			)
		)
	})

	return { actor, updatedMentions }
}
