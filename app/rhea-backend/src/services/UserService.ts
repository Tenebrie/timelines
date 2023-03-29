import { User } from '@prisma/client'

import { dbClient } from './DatabaseClient'

export const UserService = {
	findByEmail: async (email: string): Promise<User | null> => {
		return dbClient.user.findFirst({
			where: {
				email,
			},
		})
	},

	register: async (email: string, username: string, password: string): Promise<User> => {
		const user = await dbClient.user.create({
			data: {
				email,
				username,
				password,
			},
		})
		return user
	},

	login: async (email: string, password: string): Promise<User | null> => {
		const user = await UserService.findByEmail(email)
		if (!user) {
			return null
		}

		if (user.password === password) {
			return user
		}
		return null
	},
}
