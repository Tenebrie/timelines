import { User, WorldCalendarType } from '@prisma/client'

import { dbClient } from './DatabaseClient'

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

	listAvailableWorlds: async (params: { owner: User }) => {
		const worlds = await dbClient.world.findMany({
			where: {
				OR: [
					{ owner: params.owner },
					{
						collaborators: {
							some: {
								user: params.owner,
							},
						},
					},
				],
			},
			include: {
				collaborators: true,
			},
		})

		const ownedWorlds = worlds.filter((world) => world.ownerId === params.owner.id)

		const contributableWorlds = worlds.filter((world) =>
			world.collaborators.some((user) => user.userId === params.owner.id && user.access === 'Editing')
		)

		const visibleWorlds = worlds.filter((world) =>
			world.collaborators.some((user) => user.userId === params.owner.id && user.access === 'ReadOnly')
		)

		return {
			ownedWorlds,
			contributableWorlds,
			visibleWorlds,
		}
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
}
