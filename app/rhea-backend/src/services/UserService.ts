import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'

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
		const hashedPassword = await bcrypt.hash(password, 8)
		const user = await dbClient.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
			},
		})
		return user
	},

	login: async (email: string, password: string): Promise<User | null> => {
		const user = await UserService.findByEmail(email)
		if (!user) {
			return null
		}

		const passwordMatches = await bcrypt.compare(password, user.password)
		if (passwordMatches) {
			return user
		}
		return null
	},

	migratePasswords: async (): Promise<void> => {
		const allUsers = await dbClient.user.findMany()

		for (let i = 0; i < allUsers.length; i++) {
			const user = allUsers[i]
			const password = await bcrypt.hash(user.password, 8)

			await dbClient.user.update({
				where: {
					id: user.id,
				},
				data: {
					password,
				},
			})
		}
	},
}
