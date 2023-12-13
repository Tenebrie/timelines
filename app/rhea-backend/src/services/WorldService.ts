import { User, WorldCalendarType } from '@prisma/client'
import { BadRequestError } from 'tenebrie-framework'

import { AnnouncementService } from './AnnouncementService'
import { dbClient } from './DatabaseClient'
import { RedisService } from './RedisService'

export const WorldService = {
	createWorld: async (params: {
		owner: User
		name: string
		calendar?: WorldCalendarType
		timeOrigin?: number
	}) => {
		return dbClient.world.create({
			data: {
				name: params.name,
				ownerId: params.owner.id,
				calendar: params.calendar,
				timeOrigin: params.timeOrigin,
			},
			select: {
				id: true,
				name: true,
			},
		})
	},

	deleteWorld: async (worldId: string) => {
		return dbClient.world.delete({
			where: {
				id: worldId,
			},
		})
	},

	listOwnedWorlds: async (params: { owner: User }) => {
		return dbClient.world.findMany({
			where: {
				owner: params.owner,
			},
		})
	},

	findWorldDetails: async (worldId: string) => {
		return dbClient.world.findFirstOrThrow({
			where: {
				id: worldId,
			},
			include: {
				actors: {
					include: {
						statements: {
							select: {
								id: true,
							},
						},
						relationships: true,
						receivedRelationships: true,
					},
				},
				events: {
					include: {
						targetActors: true,
						mentionedActors: true,
						introducedActors: true,
						terminatedActors: true,
						deltaStates: {
							orderBy: {
								timestamp: 'asc',
							},
						},
					},
				},
			},
		})
	},

	shareWorld: async (worldId: string, userEmails: string[]) => {
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

		await dbClient.world.update({
			where: {
				id: worldId,
			},
			data: {
				collaborators: {
					connect: users.map((user) => ({
						id: user.id,
					})),
				},
			},
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

	unshareWorld: async ({ worldId, userEmail }: { worldId: string; userEmail: string }) => {
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

		await dbClient.world.update({
			where: {
				id: worldId,
			},
			data: {
				collaborators: {
					disconnect: {
						id: user.id,
					},
				},
			},
		})

		RedisService.notifyAboutWorldUnshared({
			user,
			worldId,
		})
	},
}
