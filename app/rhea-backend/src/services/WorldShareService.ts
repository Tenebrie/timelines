import { CollaboratorAccess } from '@prisma/client'
import { BadRequestError } from 'tenebrie-framework'

import { AnnouncementService } from './AnnouncementService'
import { dbClient } from './DatabaseClient'
import { RedisService } from './RedisService'

export const WorldShareService = {
	listCollaborators: async ({ worldId }: { worldId: string }) => {
		return dbClient.collaboratingUser.findMany({
			where: {
				worldId,
			},
			include: {
				user: {
					select: {
						email: true,
					},
				},
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

		const users = userResults
			.map((user) => {
				if (user.status === 'rejected') {
					return null
				}
				return user.value
			})
			.filter((user) => !!user)
			.map((user) => user as NonNullable<typeof user>)

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

	removeCollaborator: async ({ worldId, userEmail }: { worldId: string; userEmail: string }) => {
		const world = await dbClient.world.findFirst({
			where: {
				id: worldId,
			},
		})

		if (!world) {
			throw new BadRequestError(`Unable to find world.`)
		}

		const user = await dbClient.user.findFirst({
			where: {
				email: userEmail,
			},
		})

		if (!user) {
			throw new BadRequestError('Unable to find user.')
		}

		await dbClient.collaboratingUser.delete({
			where: {
				userId_worldId: {
					userId: user.id,
					worldId,
				},
			},
		})

		RedisService.notifyAboutWorldUnshared({
			user,
			worldId,
		})
	},
}
