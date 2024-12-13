import { AnnouncementType, User } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { RedisService } from './RedisService'

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
}
