import { User, World, WorldCalendarType } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient'

export const WorldService = {
	createWorld: async (params: {
		owner: User
		name: string
		description?: string
		calendar?: WorldCalendarType
		timeOrigin?: number
	}) => {
		return getPrismaClient().world.create({
			data: {
				name: params.name,
				description: params.description,
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

	updateWorld: async (params: {
		worldId: string
		data: Pick<Partial<World>, 'name' | 'description' | 'calendar' | 'accessMode'> & { timeOrigin?: number }
	}) => {
		return getPrismaClient().world.update({
			where: {
				id: params.worldId,
			},
			data: {
				...params.data,
			},
		})
	},

	deleteWorld: async (worldId: string) => {
		return getPrismaClient().world.delete({
			where: {
				id: worldId,
			},
		})
	},

	listOwnedWorlds: async (params: { owner: User }) => {
		return getPrismaClient().world.findMany({
			where: {
				owner: params.owner,
			},
		})
	},

	listAvailableWorlds: async (params: { owner: User }) => {
		const worlds = await getPrismaClient().world.findMany({
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
			world.collaborators.some((user) => user.userId === params.owner.id && user.access === 'Editing'),
		)

		const visibleWorlds = worlds.filter((world) =>
			world.collaborators.some((user) => user.userId === params.owner.id && user.access === 'ReadOnly'),
		)

		return {
			ownedWorlds,
			contributableWorlds,
			visibleWorlds,
		}
	},

	findWorldDetails: async (worldId: string) => {
		return getPrismaClient().world.findFirstOrThrow({
			where: {
				id: worldId,
			},
			include: {
				actors: {
					include: {
						mentions: true,
						mentionedIn: true,
					},
				},
				events: {
					orderBy: {
						timestamp: 'asc',
					},
					include: {
						mentions: true,
						mentionedIn: true,
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

	findWorldBrief: async (worldId: string) => {
		return getPrismaClient().world.findFirstOrThrow({
			where: {
				id: worldId,
			},
		})
	},
}
