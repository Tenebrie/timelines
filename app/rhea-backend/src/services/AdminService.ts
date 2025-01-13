import { UserLevel } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'

export const AdminService = {
	listUsers: async ({ page, size, query }: { page?: number; size?: number; query?: string }) => {
		const actualPage = page ?? 0
		const actualSize = Math.min(size ?? 20, 100)
		const result = await getPrismaClient().user.findMany({
			select: {
				id: true,
				email: true,
				level: true,
				username: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				...(query
					? {
							OR: [
								{
									email: {
										contains: query,
										mode: 'insensitive',
									},
								},
								{
									username: {
										contains: query,
										mode: 'insensitive',
									},
								},
							],
						}
					: {}),
			},
			orderBy: [{ level: 'desc' }, { updatedAt: 'desc' }],
			skip: actualPage * actualSize,
			take: actualSize,
		})
		const rowCount = await getPrismaClient().user.aggregate({
			_count: {
				id: true,
			},
			where: {
				...(query
					? {
							OR: [
								{
									email: {
										contains: query,
										mode: 'insensitive',
									},
								},
								{
									username: {
										contains: query,
										mode: 'insensitive',
									},
								},
							],
						}
					: {}),
			},
		})
		return {
			users: result,
			page: actualPage,
			size: actualSize,
			pageCount: Math.ceil(rowCount._count.id / actualSize),
		}
	},

	deleteUser: async (userId: string) => {
		return getPrismaClient().user.delete({
			where: {
				id: userId,
			},
		})
	},

	setUserLevel: async (userId: string, level: UserLevel) => {
		return getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data: {
				level,
			},
		})
	},
}
