import { Prisma } from '@prisma/client'
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
				bio: true,
				avatar: true,
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
				bio: true,
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

	deleteUser: async (userId: string) => {
		return getPrismaClient().user.delete({
			where: {
				id: userId,
			},
		})
	},

	updateUser: async (userId: string, body: Prisma.UserUpdateInput) => {
		return getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data: body,
		})
	},
}
