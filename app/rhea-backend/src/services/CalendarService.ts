import { Prisma } from '@prisma/client'
import {
	CalendarUncheckedCreateInput,
	CalendarUnitCreateManyCalendarInput,
	CalendarUnitUncheckedUpdateWithoutCalendarInput,
	CalendarUpdateInput,
} from 'prisma/client/models.js'

import { getPrismaClient } from './dbClients/DatabaseClient.js'
import { makeSortCalendarUnitsQuery } from './dbQueries/makeSortCalendarUnitsQuery.js'
import { makeTouchCalendarQuery } from './dbQueries/makeTouchCalendarQuery.js'
import { makeTouchWorldQuery } from './dbQueries/makeTouchWorldQuery.js'

export const CalendarService = {
	listUserCalendars: async ({ ownerId }: { ownerId: string }) => {
		return getPrismaClient().calendar.findMany({
			where: {
				ownerId,
				worldId: null,
			},
		})
	},

	getCalendarUnitById: async ({ calendarId, unitId }: { calendarId: string; unitId: string }) => {
		return getPrismaClient().calendarUnit.findFirstOrThrow({
			where: {
				id: unitId,
				calendarId,
			},
		})
	},

	createCalendar: async ({ params }: { params: CalendarUncheckedCreateInput }) => {
		const calendar = await getPrismaClient().calendar.create({
			data: params,
		})

		const world = params.worldId ? await makeTouchWorldQuery(params.worldId) : null

		return {
			calendar,
			world,
		}
	},

	getCalendarUnitCount: async (params: { calendarId: string }) => {
		return getPrismaClient().calendarUnit.count({
			where: {
				calendarId: params.calendarId,
			},
		})
	},

	getEditorCalendar: async ({ calendarId }: { calendarId: string }) => {
		const calendar = await getPrismaClient().calendar.findUniqueOrThrow({
			where: {
				id: calendarId,
			},
			include: {
				units: {
					orderBy: {
						position: 'asc',
					},
					include: {
						parents: {
							orderBy: {
								position: 'asc',
							},
						},
						children: {
							orderBy: {
								position: 'asc',
							},
						},
					},
				},
			},
		})

		return {
			...calendar,
		}
	},

	getWorldCalendar: async ({ calendarId }: { calendarId: string }) => {
		const calendar = await getPrismaClient().calendar.findUniqueOrThrow({
			where: {
				id: calendarId,
			},
			include: {
				units: {
					orderBy: {
						position: 'asc',
					},
					include: {
						parents: {
							orderBy: {
								position: 'asc',
							},
						},
						children: {
							orderBy: {
								position: 'asc',
							},
						},
					},
				},
			},
		})
		return {
			...calendar,
			units: calendar.units.map((unit) => ({
				...unit,
				displayName: (unit.displayName || unit.name).trim().toLowerCase(),
				displayNameShort: (unit.displayNameShort || unit.name).trim().substring(0, 1).toLowerCase(),
				displayNamePlural: (unit.displayNamePlural || unit.name).trim().toLowerCase(),
			})),
		}
	},

	updateCalendar: async ({ calendarId, params }: { calendarId: string; params: CalendarUpdateInput }) => {
		const calendar = await getPrismaClient().calendar.update({
			where: {
				id: calendarId,
			},
			data: params,
		})

		return {
			calendar,
		}
	},

	createCalendarUnit: async ({
		calendarId,
		params,
	}: {
		calendarId: string
		params: Omit<CalendarUnitCreateManyCalendarInput, 'calendar'>
	}) => {
		const unit = await getPrismaClient().$transaction(async (dbClient) => {
			await dbClient.calendarUnit.create({
				data: {
					...params,
					calendarId,
					position: params.position * 2,
				},
			})

			await CalendarService.computeCalendarUnitDurations({ calendarId }, dbClient)
			await makeTouchCalendarQuery(calendarId, dbClient)

			return dbClient.calendarUnit.findFirstOrThrow({
				where: {
					calendarId,
				},
			})
		})

		return {
			unit,
		}
	},

	updateCalendarUnit: async ({
		calendarId,
		unitId,
		params,
	}: {
		calendarId: string
		unitId: string
		params: Omit<CalendarUnitUncheckedUpdateWithoutCalendarInput, 'calendar' | 'children'> & {
			children:
				| {
						childUnitId: string
						repeats: number
						label?: string | null
				  }[]
				| undefined
		}
	}) => {
		const unit = await getPrismaClient().$transaction(async (dbClient) => {
			await dbClient.calendarUnit.update({
				where: {
					id: unitId,
					calendarId,
				},
				data: {
					...params,
					children: params.children
						? {
								deleteMany: {},
								createMany: {
									data: params.children.map((child, index) => ({
										childUnitId: child.childUnitId,
										label: child.label,
										repeats: child.repeats,
										position: index * 2,
									})),
								},
							}
						: undefined,
				},
			})

			await CalendarService.computeCalendarUnitDurations({ calendarId }, dbClient)
			if (params.position !== undefined) {
				await makeSortCalendarUnitsQuery(calendarId, dbClient)
			}
			await makeTouchCalendarQuery(calendarId, dbClient)

			return dbClient.calendarUnit.findUniqueOrThrow({
				where: {
					id: unitId,
				},
				include: {
					children: {
						orderBy: {
							position: 'asc',
						},
					},
				},
			})
		})

		return {
			unit,
		}
	},

	deleteCalendar: async ({ calendarId }: { calendarId: string }) => {
		return await getPrismaClient().calendar.delete({
			where: { id: calendarId },
		})
	},

	deleteCalendarUnit: async ({ calendarId, unitId }: { calendarId: string; unitId: string }) => {
		const unit = await getPrismaClient().$transaction(async (dbClient) => {
			const unit = await dbClient.calendarUnit.delete({
				where: {
					id: unitId,
					calendarId,
				},
			})

			await CalendarService.computeCalendarUnitDurations({ calendarId }, dbClient)
			await makeSortCalendarUnitsQuery(calendarId, dbClient)
			await makeTouchCalendarQuery(calendarId, dbClient)
			return unit
		})

		return {
			unit,
		}
	},

	computeCalendarUnitDurations: async (
		{ calendarId }: { calendarId: string },
		dbClient?: Prisma.TransactionClient,
	) => {
		dbClient = dbClient ?? getPrismaClient()

		const allUnits = await dbClient.calendarUnit.findMany({
			where: {
				calendarId,
			},
			include: {
				children: {
					orderBy: {
						position: 'asc',
					},
				},
			},
		})

		const durationCache: Map<string, number> = new Map()

		function getTotalDuration(unit: (typeof allUnits)[number], depth: number): number {
			if (depth > 25) {
				throw new Error('Circular dependency in calendar unit definitions')
			}

			if (durationCache.has(unit.id)) {
				return durationCache.get(unit.id)!
			}

			if (unit.children.length === 0) {
				// Leaf nodes have implicit duration of 1
				durationCache.set(unit.id, 1)
				return 1
			}

			let total = 0
			for (const childRel of unit.children) {
				const childUnit = allUnits.find((u) => u.id === childRel.childUnitId)
				if (childUnit) {
					total += getTotalDuration(childUnit, depth + 1) * childRel.repeats
				}
			}

			durationCache.set(unit.id, total)
			return total
		}

		// Calculate all durations
		for (const unit of allUnits) {
			getTotalDuration(unit, 0)
		}

		const depthCache: Map<string, number> = new Map()

		function propagateDepth(unit: (typeof allUnits)[number], currentDepth: number): void {
			if (currentDepth > 25) {
				throw new Error('Circular dependency in calendar unit definitions')
			}

			const existingDepth = depthCache.get(unit.id) ?? -1
			if (currentDepth <= existingDepth) {
				// Already visited at this depth or deeper, no need to continue
				return
			}

			depthCache.set(unit.id, currentDepth)

			// Propagate to all children
			for (const childRel of unit.children) {
				const childUnit = allUnits.find((u) => u.id === childRel.childUnitId)
				if (childUnit) {
					propagateDepth(childUnit, currentDepth + 1)
				}
			}
		}

		// Start traversal from each unit at depth 0
		for (const unit of allUnits) {
			propagateDepth(unit, 0)
		}

		// Combine results and update database
		const values = allUnits.map((unit) => ({
			unit,
			duration: durationCache.get(unit.id) ?? 1,
			depth: depthCache.get(unit.id) ?? 0,
		}))

		return Promise.all(
			values.map((data) =>
				dbClient.calendarUnit.update({
					where: {
						id: data.unit.id,
					},
					data: {
						duration: data.duration,
						treeDepth: data.depth,
					},
				}),
			),
		)
	},
}
