import { UserLevel } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { UserUncheckedUpdateInput } from 'prisma/client/models.js'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

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
				bio: true,
				createdAt: true,
				updatedAt: true,
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
			users: result,
			page: actualPage,
			size: actualSize,
			pageCount: Math.ceil(rowCount._count.id / actualSize),
		}
	},

	getUserByEmail: async (email: string) => {
		return getPrismaClient().user.findUnique({
			where: {
				email,
			},
		})
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
