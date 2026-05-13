import { Mention, Prisma, ReferenceHoldingEntity } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export type MentionData = Pick<Mention, 'targetId' | 'targetType'>

export const AssetRefService = {
	createReferences: async (
		holderId: string,
		holderType: ReferenceHoldingEntity,
		assets: string[] | undefined,
		prisma?: Prisma.TransactionClient,
	) => {
		if (!assets) {
			return []
		}

		const data = assets.map((assetId) => {
			return {
				holderId: holderId,
				holderType: holderType,

				assetId,

				holderActorId: holderType === ReferenceHoldingEntity.Actor ? holderId : undefined,
				holderEventId: holderType === ReferenceHoldingEntity.Event ? holderId : undefined,
				holderArticleId: holderType === ReferenceHoldingEntity.Article ? holderId : undefined,
				holderTagId: holderType === ReferenceHoldingEntity.Tag ? holderId : undefined,
			}
		})

		await getPrismaClient(prisma).assetReference.createMany({
			data,
			skipDuplicates: true,
		})

		await getPrismaClient(prisma).asset.updateMany({
			where: {
				id: {
					in: assets,
				},
			},
			data: {
				expiresAt: null,
			},
		})

		return data
	},

	clearOrphanedReferences: async (transaction?: Prisma.TransactionClient) => {
		await (transaction ?? getPrismaClient()).assetReference.deleteMany({
			where: {
				holderArticleId: null,
				holderEventId: null,
				holderTagId: null,
				holderActorId: null,
			},
		})
	},
}
