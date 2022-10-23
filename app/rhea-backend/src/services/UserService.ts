import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export const UserService = {
	findByEmail: async (email: string): Promise<User | null> => {
		return prisma.user.findFirst({
			where: {
				email,
			}
		})
	},

	register: async (email: string, username: string, password: string): Promise<User> => {
		const user = await prisma.user.create({
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
