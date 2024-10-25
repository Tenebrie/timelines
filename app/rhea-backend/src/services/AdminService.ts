import { UserLevel } from '@prisma/client'

import { dbClient } from './dbClients/DatabaseClient'

export const AdminService = {
	listUsers: async () => {
		return dbClient.user.findMany({
			select: {
				id: true,
				email: true,
				level: true,
				username: true,
			},
		})
	},

	deleteUser: async (userId: string) => {
		return dbClient.user.delete({
			where: {
				id: userId,
			},
		})
	},

	setUserLevel: async (userId: string, level: UserLevel) => {
		return dbClient.user.update({
			where: {
				id: userId,
			},
			data: {
				level,
			},
		})
	},
}
