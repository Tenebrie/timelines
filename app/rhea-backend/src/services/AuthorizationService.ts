import { User } from '@prisma/client'
import { UnauthorizedError } from 'moonflower'

import { dbClient } from './dbClients/DatabaseClient'

export const AuthorizationService = {
	checkUserReadAccess: async (user: User, worldId: string) => {
		const count = await dbClient.world.count({
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
		if (count === 0) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserWriteAccess: async (user: User, worldId: string) => {
		const count = await dbClient.world.count({
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
		if (count === 0) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserWorldOwner: async (user: User, worldId: string) => {
		const count = await dbClient.world.count({
			where: {
				id: worldId,
				owner: user,
			},
		})
		if (count === 0) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserAnnouncementAccess: async (user: User, announcementId: string) => {
		const count = await dbClient.userAnnouncement.count({
			where: {
				id: announcementId,
				user,
			},
		})
		if (count === 0) {
			throw new UnauthorizedError('No access to this announcement')
		}
	},
}
