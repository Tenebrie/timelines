import { User } from '@prisma/client'
import { UnauthorizedError } from 'moonflower'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { WorldService } from './WorldService'

export const AuthorizationService = {
	checkUserReadAccess: async (user: User | undefined, worldId: string) => {
		if (!user) {
			throw new UnauthorizedError('No access to this world')
		}
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

	checkUserWriteAccess: async (user: User | undefined, worldId: string) => {
		if (!user) {
			throw new UnauthorizedError('No access to this world')
		}
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

	canUserEditWorld: async (
		world: Awaited<ReturnType<typeof WorldService.findWorldDetails>>,
		user: User | undefined
	) => {
		if (world.accessMode === 'PublicEdit') {
			return true
		}
		if (!user) {
			return false
		}

		if (world.ownerId === user.id) {
			return true
		}

		const collaboratingUser = await getPrismaClient().collaboratingUser.findFirst({
			where: {
				userId: user.id,
				worldId: world.id,
				access: 'Editing',
			},
			select: {
				access: true,
			},
		})
		if (collaboratingUser) {
			return true
		}
		return false
	},
}
