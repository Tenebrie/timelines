import { User, World } from '@prisma/client'
import { UnauthorizedError } from 'moonflower/errors/UserFacingErrors'

import { getPrismaClient } from './dbClients/DatabaseClient'
import { WorldService } from './WorldService'

export const AuthorizationService = {
	checkUserReadAccess: async (user: User | undefined, world: World) => {
		if (world.accessMode === 'PublicRead' || world.accessMode === 'PublicEdit') {
			return
		}

		if (!user) {
			throw new UnauthorizedError('No access to this world')
		}

		if (user.id === world.ownerId) {
			return
		}

		const worldWithCollaboratorsCount = await getPrismaClient().world.count({
			where: {
				id: world.id,
				collaborators: {
					some: {
						userId: user.id,
					},
				},
			},
		})
		if (!worldWithCollaboratorsCount) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserWriteAccess: async (user: User | undefined, world: World) => {
		if (!user) {
			throw new UnauthorizedError('No access to this world')
		}

		if (user.id === world.ownerId || world.accessMode === 'PublicEdit') {
			return
		}

		const worldWithCollaboratorsCount = await getPrismaClient().world.count({
			where: {
				id: world.id,
				collaborators: {
					some: {
						userId: user.id,
						access: 'Editing',
					},
				},
			},
		})
		if (!worldWithCollaboratorsCount) {
			throw new UnauthorizedError('No access to this world')
		}
	},

	checkUserReadAccessById: async (user: User | undefined, worldId: string) => {
		const worldBrief = await WorldService.findWorldBrief(worldId)
		await AuthorizationService.checkUserReadAccess(user, worldBrief)
	},

	checkUserWriteAccessById: async (user: User | undefined, worldId: string) => {
		const worldBrief = await WorldService.findWorldBrief(worldId)
		await AuthorizationService.checkUserWriteAccess(user, worldBrief)
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
		user: User | undefined,
	) => {
		if (!user) {
			return false
		}

		if (world.accessMode === 'PublicEdit' || world.ownerId === user.id) {
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

	checkUserAssetAccess: async (userId: string, assetId: string) => {
		const count = await getPrismaClient().asset.count({
			where: {
				id: assetId,
				ownerId: userId,
			},
		})
		if (!count) {
			throw new UnauthorizedError('No access to this asset')
		}
	},
}
