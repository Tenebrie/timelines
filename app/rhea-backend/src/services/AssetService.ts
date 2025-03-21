import { Prisma } from '@prisma/client'
import { BadRequestError } from 'moonflower'

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

	updateAsset: async (assetId: string, data: Prisma.AssetUpdateInput) => {
		return await getPrismaClient().asset.update({
			where: { id: assetId },
			data,
		})
	},

	setUserAvatar: async (userId: string, assetId: string) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			const asset = await prisma.asset.findUnique({
				where: {
					id: assetId,
					ownerId: userId,
				},
			})
			if (!asset) {
				throw new BadRequestError('Target asset is not valid')
			}

			return await getPrismaClient().user.update({
				where: {
					id: userId,
				},
				data: {
					avatar: {
						connect: asset,
					},
				},
			})
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
