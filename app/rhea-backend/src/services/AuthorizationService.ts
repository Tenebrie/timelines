import { User } from '@prisma/client'
import { UnauthorizedError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient'

export const AuthorizationService = {
	checkUserReadAccess: async (user: User, worldId: string) => {
		const count = await getPrismaClient().world.count({
			where: {
				OR: [
					{
						id: worldId,
						owner: user,
					},
					{
						id: worldId,
						collaborators: {
							some: {
								userId: user.id,
							},
						},
					},
				],
			},
		})
		if (!count) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserWriteAccess: async (user: User, worldId: string) => {
		const count = await getPrismaClient().world.count({
			where: {
				OR: [
					{
						id: worldId,
						owner: user,
					},
					{
						id: worldId,
						collaborators: {
							some: {
								userId: user.id,
								access: 'Editing',
							},
						},
					},
				],
			},
		})
		if (!count) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserWorldOwner: async (user: User, worldId: string) => {
		const count = await getPrismaClient().world.count({
			where: {
				id: worldId,
				owner: user,
			},
		})
		if (!count) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserAnnouncementAccess: async (user: User, announcementId: string) => {
		const count = await getPrismaClient().userAnnouncement.count({
			where: {
				id: announcementId,
				user,
			},
		})
		if (!count) {
			throw new UnauthorizedError('No access to this announcement')
		}
	},
}
