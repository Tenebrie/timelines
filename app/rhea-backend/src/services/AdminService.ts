import { dbClient } from './DatabaseClient'

export const AdminService = {
	listUsers: async () => {
		return dbClient.user.findMany({})
	},
}
