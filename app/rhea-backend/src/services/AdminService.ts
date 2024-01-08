import { dbClient } from './DatabaseClient'

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
}
