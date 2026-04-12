import { AnnouncementType, User } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { RedisService } from './RedisService.js'

export const AnnouncementService = {
	notify: async ({
		type,
		userId,
		title,
		description,
	}: {
		type: AnnouncementType
		userId: string
		title: string
		description: string
	}) => {
		const announcement = await getPrismaClient().userAnnouncement.create({
			data: {
				type,
				userId,
				title,
				description,
			},
		})
		RedisService.notifyAboutNewAnnouncement({
			userId,
		})
		return announcement
	},

	notifyMany: (
		announcements: {
			type: AnnouncementType
			userId: string
			title: string
			description: string
		}[],
	) => {
		return Promise.all(announcements.map((announcement) => AnnouncementService.notify(announcement)))
	},

	listAnnouncements: ({ user }: { user: User }) => {
		return getPrismaClient().userAnnouncement.findMany({
			where: {
				userId: user.id,
			},
		})
	},

	dismiss: ({ id }: { id: string }) => {
		return getPrismaClient().userAnnouncement.delete({
			where: {
				id,
			},
		})
	},

	dismissAll: ({ user }: { user: User }) => {
		return getPrismaClient().userAnnouncement.deleteMany({
			where: {
				userId: user.id,
			},
		})
	},

	broadcastNotification: async ({
		title,
		description,
		testRun,
	}: {
		title: string
		description: string
		testRun: boolean
	}) => {
		const users = await getPrismaClient().user.findMany({
			select: { id: true },
			where: {
				deletedAt: null,
				...(testRun ? { level: 'Admin' } : {}),
			},
		})

		const announcements = users.map((user) => ({
			type: 'Info' as const,
			userId: user.id,
			title,
			description,
		}))

		await AnnouncementService.notifyMany(announcements)

		return { recipientCount: users.length }
	},

	sendWelcomeNotification: async (userId: string) => {
		AnnouncementService.notify({
			type: 'Welcome',
			userId,
			title: 'Welcome!',
			description:
				'Welcome to Neverkin!\nExplore on your own, or join our Discord community for support.\n\nJoin at https://discord.gg/rD3KdXmqDP',
		})
	},
}
