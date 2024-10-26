import { UserLevel } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'

export const AdminService = {
	listUsers: async () => {
		return getPrismaClient().user.findMany({
			select: {
				id: true,
				email: true,
				level: true,
				username: true,
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
}
