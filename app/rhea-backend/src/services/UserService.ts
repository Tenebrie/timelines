import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeTouchUserQuery } from './dbQueries/makeTouchUserQuery.js'

export const UserService = {
	touchUser: async (userId: string) => {
		return makeTouchUserQuery(userId)
	},

	findByIdInternal: async (id: string) => {
		return getPrismaClient().user.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		})
	},

	findByEmail: async (email: string) => {
		return getPrismaClient().user.findFirst({
			where: {
				email,
				deletedAt: null,
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
		const hashedPassword = await bcrypt.hash(password, 12)
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
				deletedAt: null,
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
		return getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data: {
				deletedAt: new Date(),
			},
		})
	},

	updateUser: async (userId: string, body: Prisma.UserUpdateInput) => {
		return getPrismaClient().user.update({
			where: {
				id: userId,
				deletedAt: null,
			},
			data: body,
		})
	},

	changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
		const user = await getPrismaClient().user.findUnique({
			where: {
				id: userId,
				deletedAt: null,
			},
		})

		if (!user) {
			return false
		}

		const passwordMatches = await bcrypt.compare(currentPassword, user.password)
		if (!passwordMatches) {
			return false
		}

		const hashedPassword = await bcrypt.hash(newPassword, 12)
		await getPrismaClient().user.update({
			where: {
				id: userId,
			},
			data: {
				password: hashedPassword,
			},
		})

		return true
	},

	cleanUpDeletedUsers: async () => {
		await getPrismaClient().user.updateMany({
			where: {
				deletionScheduledAt: {
					lt: new Date(),
				},
			},
			data: {
				deletedAt: new Date(),
			},
		})

		return getPrismaClient().user.deleteMany({
			where: {
				deletedAt: { not: null },
			},
		})
	},

	/**
	 * Deletes test users created by Playwright e2e tests or k6 load tests.
	 * Only matches emails exactly matching these patterns:
	 * - playwright-{anything}@localhost
	 * - k6-loadtest-{anything}@localhost
	 */
	cleanUpTestUsers: async () => {
		return getPrismaClient().user.updateMany({
			where: {
				deletedAt: null,
				OR: [
					{ email: { startsWith: 'playwright-', endsWith: '@localhost' } },
					{ email: { startsWith: 'k6-loadtest-', endsWith: '@localhost' } },
				],
			},
			data: {
				deletionScheduledAt: new Date(Date.now() + 60 * 1000),
			},
		})
	},
}
