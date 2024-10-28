import * as bcrypt from 'bcrypt'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { makeTouchUserQuery } from './dbQueries/makeTouchUserQuery'

export const UserService = {
	touchUser: async (userId: string) => {
		return makeTouchUserQuery(userId)
	},

	findByEmail: async (email: string) => {
		return getPrismaClient().user.findFirst({
			where: {
				email,
			},
			select: {
				id: true,
				level: true,
				email: true,
				username: true,
			},
		})
	},

	register: async (email: string, username: string, password: string) => {
		const hashedPassword = await bcrypt.hash(password, 8)
		const user = await getPrismaClient().user.create({
			data: {
				email,
				username,
				password: hashedPassword,
			},
			select: {
				id: true,
				level: true,
				email: true,
				username: true,
			},
		})
		return user
	},

	login: async (email: string, password: string) => {
		const user = await getPrismaClient().user.findFirst({
			where: {
				email,
			},
		})

		if (!user) {
			return null
		}

		const passwordMatches = await bcrypt.compare(password, user.password)
		if (passwordMatches) {
			return UserService.findByEmail(email)
		}
		return null
	},
}
