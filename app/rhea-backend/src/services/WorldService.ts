import { User, World } from '@prisma/client'
import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'

import { CalendarService } from './CalendarService.js'

export const WorldService = {
	findWorldByIdInternal: async (worldId: string) => {
		return getPrismaClient().world.findFirst({
			where: {
				id: worldId,
			},
		})
	},

	createWorld: async (params: {
		owner: User
		name: string
		description?: string
		calendars?: string[]
		timeOrigin?: number
	}) => {
		return await getPrismaClient().$transaction(async (prisma) => {
			const world = await prisma.world.create({
				data: {
					name: params.name,
					description: params.description,
					ownerId: params.owner.id,
					timeOrigin: params.timeOrigin,
				},
				select: {
					id: true,
					name: true,
				},
			})

			if (params.calendars) {
				await CalendarService.assignCalendarsToWorld({
					worldId: world.id,
					calendarsIds: params.calendars,
					prisma,
				})
			}
			return world
		})
	},

	updateWorld: async (params: {
		worldId: string
		data: Pick<Partial<World>, 'name' | 'description' | 'accessMode'> & {
			timeOrigin?: number
			calendars?: string[]
		}
	}) => {
		await getPrismaClient().$transaction(async (prisma) => {
			if (params.data.calendars) {
				await CalendarService.assignCalendarsToWorld({
					worldId: params.worldId,
					calendarsIds: params.data.calendars,
					prisma,
				})
			}

			const { calendars: _, ...data } = params.data

			await prisma.world.update({
				where: {
					id: params.worldId,
				},
				data,
			})
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
				calendars: true,
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
		const world = await getPrismaClient().world.findFirstOrThrow({
			where: {
				id: worldId,
			},
			include: {
				actors: {
					include: {
						pages: {
							select: {
								id: true,
								name: true,
							},
						},
						mentions: {
							select: {
								targetId: true,
								targetType: true,
							},
						},
						mentionedIn: {
							select: {
								sourceId: true,
								sourceType: true,
							},
						},
					},
					omit: {
						descriptionYjs: true,
					},
				},
				events: {
					orderBy: {
						timestamp: 'asc',
					},
					omit: {
						descriptionYjs: true,
					},
					include: {
						pages: {
							select: {
								id: true,
								name: true,
							},
						},
						mentions: {
							select: {
								targetId: true,
								targetType: true,
							},
						},
						mentionedIn: {
							select: {
								sourceId: true,
								sourceType: true,
							},
						},
						deltaStates: {
							orderBy: {
								timestamp: 'asc',
							},
						},
					},
				},
				calendars: {
					include: {
						units: {
							include: {
								parents: true,
								children: true,
							},
						},
						presentations: {
							include: {
								units: true,
							},
							orderBy: {
								scaleFactor: 'asc',
							},
						},
						seasons: {
							include: {
								intervals: true,
							},
						},
					},
				},
				tags: {
					include: {
						mentions: {
							select: {
								targetId: true,
								targetType: true,
							},
						},
						mentionedIn: {
							select: {
								sourceId: true,
								sourceType: true,
							},
						},
					},
				},
			},
		})
		return {
			...world,
			calendars: world.calendars.map((calendar) => ({
				...calendar,
				units: calendar.units.map((unit) => ({
					...unit,
					displayName: (unit.displayName || unit.name).trim().toLowerCase(),
					displayNameShort: (unit.displayNameShort || unit.name).trim().substring(0, 1).toLowerCase(),
					displayNamePlural: (unit.displayNamePlural || unit.name).trim().toLowerCase(),
				})),
			})),
		}
	},

	findWorldBrief: async (worldId: string) => {
		return getPrismaClient().world.findFirstOrThrow({
			where: {
				id: worldId,
			},
		})
	},
}
