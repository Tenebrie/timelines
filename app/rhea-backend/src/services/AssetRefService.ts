import { AssetReference, Prisma, ReferenceHoldingEntity } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export function dedupeReferences<T extends Pick<AssetReference, 'holderId' | 'assetId'>>(
	references: T[],
): T[] {
	const unique = new Map<string, T>()
	for (const reference of references) {
		unique.set(`${reference.holderId}->${reference.assetId}`, reference)
	}
	return Array.from(unique.values())
}

export const AssetRefService = {
	createReferences: async ({
		worldId,
		holderId,
		holderType,
		assets,
		pageId,
		prisma,
	}: {
		worldId: string
		holderId: string
		holderType: ReferenceHoldingEntity
		assets: string[] | undefined
		pageId: string | null
		prisma?: Prisma.TransactionClient
	}): Promise<AssetReference[] | undefined> => {
		if (!assets) {
			return undefined
		}

		const client = getPrismaClient(prisma)

		const holderColumn = {
			holderActorId: holderType === ReferenceHoldingEntity.Actor ? holderId : undefined,
			holderEventId: holderType === ReferenceHoldingEntity.Event ? holderId : undefined,
			holderArticleId: holderType === ReferenceHoldingEntity.Article ? holderId : undefined,
			holderTagId: holderType === ReferenceHoldingEntity.Tag ? holderId : undefined,
		}

		const data = dedupeReferences(
			assets.map((assetId) => ({
				holderId: holderId,
				holderType: holderType,

				assetId,
				worldId,

				pageId: pageId,

				...holderColumn,
			})),
		)

		await client.assetReference.createMany({
			data,
			skipDuplicates: true,
		})

		await client.asset.updateMany({
			where: {
				id: {
					in: assets,
				},
			},
			data: {
				expiresAt: null,
			},
		})

		const otherSliceReferences = await client.assetReference.findMany({
			where: {
				...holderColumn,
				...(pageId === null
					? { pageId: { not: null } }
					: { OR: [{ pageId: null }, { pageId: { not: pageId } }] }),
			},
		})

		return dedupeReferences([...(data as AssetReference[]), ...otherSliceReferences])
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
