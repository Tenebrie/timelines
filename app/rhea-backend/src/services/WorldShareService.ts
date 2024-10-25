import { CollaboratorAccess } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { AnnouncementService } from './AnnouncementService'
import { dbClient } from './dbClients/DatabaseClient'
import { RedisService } from './RedisService'

export const WorldShareService = {
	listCollaborators: async ({ worldId }: { worldId: string }) => {
		return dbClient.collaboratingUser.findMany({
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
		const world = await dbClient.world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		const userResults = await Promise.allSettled(
			userEmails.map((email) =>
				dbClient.user.findFirst({
					where: {
						email,
					},
				})
			)
		)

		const users = userResults.flatMap((user) => {
			if (user.status === 'rejected' || user.value === null) {
				return []
			}
			return user.value
		})

		if (users.length === 0) {
			return
		}

		await dbClient.$transaction([
			dbClient.collaboratingUser.deleteMany(
				...users.map((user) => ({
					where: {
						AND: {
							userId: user.id,
							worldId: worldId,
						},
					},
				}))
			),
			dbClient.collaboratingUser.createMany(
				...users.map((user) => ({
					data: {
						userId: user.id,
						worldId,
						access,
					},
				}))
			),
		])

		RedisService.notifyAboutWorldShared({
			users,
			worldId,
		})

		await AnnouncementService.notifyMany(
			users.map((user) => ({
				type: 'WorldShared',
				userId: user.id,
				title: 'Collaboration invite',
				description: 'Someone has shared their World with you!',
			}))
		)
	},

	removeCollaborator: async ({ worldId, userId }: { worldId: string; userId: string }) => {
		const world = await dbClient.world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		await dbClient.collaboratingUser.delete({
			where: {
				userId_worldId: {
					userId,
					worldId,
				},
			},
		})

		RedisService.notifyAboutWorldUnshared({
			userId,
			worldId,
		})
	},
}
