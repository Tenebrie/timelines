import { AssetStatus, Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'

export const AssetService = {
	getAsset: async (assetId: string) => {
		return await getPrismaClient().asset.findUnique({
			where: { id: assetId },
		})
	},

	createAsset: async (data: Prisma.AssetCreateInput) => {
		return await getPrismaClient().asset.create({
			data,
		})
	},

	updateAssetStatus: async (assetId: string, status: AssetStatus) => {
		return await getPrismaClient().asset.update({
			where: { id: assetId },
			data: { status },
		})
	},

	getUsedQuota: async (userId: string) => {
		const result = await getPrismaClient().asset.aggregate({
			_sum: {
				size: true,
			},
			where: {
				ownerId: userId,
			},
		})
		return result._sum.size ?? 0
	},
}
