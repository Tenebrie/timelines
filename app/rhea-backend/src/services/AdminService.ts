import { UserLevel } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { UserUncheckedUpdateInput } from '../../prisma/client/models.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const AdminService = {
	listUserActivityStats: async () => {
		const dailyActiveUsers = await getPrismaClient().user.aggregate({
			where: {
				updatedAt: {
					gte: new Date(new Date().setDate(new Date().getDate() - 1)),
				},
			},
			_count: {
				id: true,
			},
		})

		const weeklyActiveUsers = await getPrismaClient().user.aggregate({
			where: {
				updatedAt: {
					gte: new Date(new Date().setDate(new Date().getDate() - 7)),
				},
			},
			_count: {
				id: true,
			},
		})
		const monthlyActiveUsers = await getPrismaClient().user.aggregate({
			where: {
				updatedAt: {
					gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
				},
			},
			_count: {
				id: true,
			},
		})
		return {
			dailyActiveUsers: dailyActiveUsers._count.id,
			weeklyActiveUsers: weeklyActiveUsers._count.id,
			monthlyActiveUsers: monthlyActiveUsers._count.id,
		}
	},

	listUsers: async ({ page, size, query }: { page?: number; size?: number; query?: string }) => {
		const actualPage = page ?? 0
		const actualSize = Math.min(size ?? 20, 100)
		const result = await getPrismaClient().user.findMany({
			select: {
				id: true,
				email: true,
				level: true,
				username: true,
				bio: true,
				createdAt: true,
				updatedAt: true,
				featureFlags: {
					select: {
						flag: true,
					},
				},
			},
			where: {
				...(query
					? {
							deletedAt: null,
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
			users: result.map((user) => ({
				...user,
				featureFlags: user.featureFlags.map((entry) => entry.flag),
			})),
			page: actualPage,
			size: actualSize,
			pageCount: Math.ceil(rowCount._count.id / actualSize),
		}
	},

	getUserByEmail: async (email: string) => {
		const user = await getPrismaClient().user.findUnique({
			where: {
				email,
			},
			include: {
				featureFlags: {
					select: {
						flag: true,
					},
				},
			},
		})

		if (!user) {
			return null
		}

		return {
			...user,
			featureFlags: user.featureFlags.map((entry) => entry.flag),
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

	updateUser: async (userId: string, data: UserUncheckedUpdateInput) => {
		return getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data,
		})
	},

	setUserPassword: async (userId: string, password: string) => {
		const hashedPassword = await bcrypt.hash(password, 12)
		return getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data: {
				password: hashedPassword,
			},
		})
	},
}
