import { AssetType, Prisma } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const AssetService = {
	getAsset: async (assetId: string) => {
		return await getPrismaClient().asset.findUnique({
			where: { id: assetId },
		})
	},

	listUserAssets: async (userId: string) => {
		return await getPrismaClient().asset.findMany({
			where: { ownerId: userId },
		})
	},

	listUserAssetsByType: async (userId: string, contentType: AssetType) => {
		return await getPrismaClient().asset.findMany({
			where: {
				ownerId: userId,
				contentType,
			},
			orderBy: { createdAt: 'desc' },
		})
	},

	listUserAssetsByTypePaginated: async (
		userId: string,
		contentType: AssetType,
		{ page, size }: { page?: number; size?: number },
	) => {
		const actualPage = page ?? 0
		const actualSize = Math.min(size ?? 20, 100)

		const where = { ownerId: userId, contentType }

		const [assets, count] = await Promise.all([
			getPrismaClient().asset.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: actualPage * actualSize,
				take: actualSize,
			}),
			getPrismaClient().asset.count({ where }),
		])

		return {
			assets,
			page: actualPage,
			size: actualSize,
			pageCount: Math.ceil(count / actualSize),
		}
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

	deleteAsset: async (assetId: string) => {
		return await getPrismaClient().asset.delete({
			where: { id: assetId },
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

	getExpiredAssets: async (currentDate: Date) => {
		return await getPrismaClient().asset.findMany({
			where: {
				expiresAt: {
					lt: currentDate,
				},
			},
		})
	},
}
