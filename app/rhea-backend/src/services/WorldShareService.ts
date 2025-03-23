import { CollaboratorAccess } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { AnnouncementService } from './AnnouncementService'
import { getPrismaClient } from './dbClients/DatabaseClient'

export const WorldShareService = {
	listCollaborators: async ({ worldId }: { worldId: string }) => {
		return getPrismaClient().collaboratingUser.findMany({
			where: {
				worldId,
			},
			select: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				worldId: true,
				access: true,
			},
		})
	},

	addCollaborators: async ({
		worldId,
		userEmails,
		access,
	}: {
		worldId: string
		userEmails: string[]
		access: CollaboratorAccess
	}) => {
		const world = await getPrismaClient().world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		const userResults = await Promise.allSettled(
			userEmails.map((email) =>
				getPrismaClient().user.findFirst({
					where: {
						email,
						deletedAt: null,
					},
				}),
			),
		)

		const users = userResults.flatMap((user) => {
			if (user.status === 'rejected' || user.value === null) {
				return []
			}
			return user.value
		})

		if (users.length === 0) {
			return { users }
		}

		await getPrismaClient().$transaction([
			getPrismaClient().collaboratingUser.deleteMany(
				...users.map((user) => ({
					where: {
						AND: {
							userId: user.id,
							worldId: worldId,
						},
					},
				})),
			),
			getPrismaClient().collaboratingUser.createMany(
				...users.map((user) => ({
					data: {
						userId: user.id,
						worldId,
						access,
					},
				})),
			),
		])

		await AnnouncementService.notifyMany(
			users.map((user) => ({
				type: 'WorldShared',
				userId: user.id,
				title: 'Collaboration invite',
				description: 'Someone has shared their World with you!',
			})),
		)

		return { users }
	},

	removeCollaborator: async ({ worldId, userId }: { worldId: string; userId: string }) => {
		const world = await getPrismaClient().world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		await getPrismaClient().collaboratingUser.delete({
			where: {
				userId_worldId: {
					userId,
					worldId,
				},
			},
		})
	},
}
