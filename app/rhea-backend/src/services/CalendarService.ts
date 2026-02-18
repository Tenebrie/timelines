import { Prisma } from '@prisma/client'
import { TransactionClient } from 'prisma/client/internal/prismaNamespace.js'
import {
	CalendarUncheckedCreateInput,
	CalendarUnitCreateManyCalendarInput,
	CalendarUnitUncheckedUpdateWithoutCalendarInput,
	CalendarUpdateInput,
} from 'prisma/client/models.js'

import { CalendarTemplateIdShape, CalendarTemplateService } from './CalendarTemplateService.js'
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

	listWorldCalendars: async ({ worldId }: { worldId: string }) => {
		return getPrismaClient().calendar.findMany({
			where: {
				ownerId: null,
				worldId,
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
				presentations: {
					include: {
						units: {
							include: {
								unit: true,
							},
						},
					},
					orderBy: {
						scaleFactor: 'asc',
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
				presentations: {
					include: {
						units: {
							include: {
								unit: true,
							},
						},
					},
					orderBy: {
						scaleFactor: 'asc',
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
					position: params.position !== undefined ? params.position * 2 : undefined,
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

	deleteCalendar: async ({
		calendarId,
		prisma,
	}: {
		calendarId: string
		prisma?: Prisma.TransactionClient
	}) => {
		return await getPrismaClient(prisma).calendar.delete({
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

	/**
	 * Calendar Presentations
	 */
	createCalendarPresentation: async ({
		calendarId,
		params,
	}: {
		calendarId: string
		params: {
			name: string
			scaleFactor?: number
		}
	}) => {
		const presentation = await getPrismaClient().$transaction(async (dbClient) => {
			const presentation = await dbClient.calendarPresentation.create({
				data: {
					name: params.name,
					scaleFactor: params.scaleFactor ?? 1.0,
					calendarId,
				},
				include: {
					baselineUnit: true,
					units: {
						include: {
							unit: true,
						},
					},
				},
			})

			await makeTouchCalendarQuery(calendarId, dbClient)
			return presentation
		})

		return { presentation }
	},

	updateCalendarPresentation: async ({
		calendarId,
		presentationId,
		params,
	}: {
		calendarId: string
		presentationId: string
		params: {
			name?: string
			units?: { unitId: string; formatString: string }[]
		}
	}) => {
		const presentation = await getPrismaClient().$transaction(async (dbClient) => {
			// If units are being updated, we need to handle the replacement
			if (params.units !== undefined) {
				// Delete existing units
				await dbClient.calendarPresentationUnit.deleteMany({
					where: { presentationId },
				})

				// Get unit durations for sorting
				const unitDurations = await dbClient.calendarUnit.findMany({
					where: {
						calendarId,
						id: { in: params.units.map((u) => u.unitId) },
					},
					select: { id: true, duration: true },
				})

				const durationMap = new Map(unitDurations.map((u) => [u.id, u.duration]))

				// Sort units by duration (descending - largest first)
				const sortedUnits = [...params.units].sort((a, b) => {
					const durationA = durationMap.get(a.unitId) ?? 0
					const durationB = durationMap.get(b.unitId) ?? 0
					return Number(durationB) - Number(durationA)
				})

				// Create new units
				for (const unit of sortedUnits) {
					const calendarUnit = await dbClient.calendarUnit.findFirst({
						where: { id: unit.unitId, calendarId },
					})
					if (calendarUnit) {
						await dbClient.calendarPresentationUnit.create({
							data: {
								presentationId,
								unitId: unit.unitId,
								name: calendarUnit.displayName || calendarUnit.name,
								formatString: unit.formatString,
							},
						})
					}
				}
			}

			await CalendarService.computePresentationFactor({ calendarId, presentationId, dbClient })

			const presentation = await dbClient.calendarPresentation.update({
				where: {
					id: presentationId,
					calendarId,
				},
				data: {
					name: params.name,
				},
				include: {
					baselineUnit: true,
					units: {
						include: {
							unit: true,
						},
					},
				},
			})

			await makeTouchCalendarQuery(calendarId, dbClient)
			return presentation
		})

		return { presentation }
	},

	computePresentationFactor: async ({
		calendarId,
		presentationId,
		dbClient,
	}: {
		calendarId: string
		presentationId: string
		dbClient: TransactionClient
	}) => {
		const existingPresentation = await dbClient.calendarPresentation.findFirstOrThrow({
			where: {
				calendarId,
				id: presentationId,
			},
			include: {
				units: {
					include: {
						unit: true,
					},
				},
			},
		})
		const scaleFactor =
			existingPresentation.units.sort((a, b) => Number(a.unit.duration) - Number(b.unit.duration))[0]?.unit
				.duration ?? 1

		await dbClient.calendarPresentation.update({
			where: {
				id: presentationId,
				calendarId,
			},
			data: {
				scaleFactor: Number(scaleFactor) * existingPresentation.compression,
			},
			include: {
				baselineUnit: true,
				units: {
					include: {
						unit: true,
					},
				},
			},
		})

		await makeTouchCalendarQuery(calendarId, dbClient)
	},

	deleteCalendarPresentation: async ({
		calendarId,
		presentationId,
	}: {
		calendarId: string
		presentationId: string
	}) => {
		const presentation = await getPrismaClient().$transaction(async (dbClient) => {
			const presentation = await dbClient.calendarPresentation.delete({
				where: {
					id: presentationId,
					calendarId,
				},
			})

			await makeTouchCalendarQuery(calendarId, dbClient)
			return presentation
		})

		return { presentation }
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

	computeCalendarPresentationFactors: async ({
		calendarId,
		dbClient,
	}: {
		calendarId: string
		dbClient: TransactionClient
	}) => {
		const presentations = await dbClient.calendarPresentation.findMany({
			where: {
				calendarId,
			},
		})

		for (const presentation of presentations) {
			await CalendarService.computePresentationFactor({
				calendarId,
				presentationId: presentation.id,
				dbClient,
			})
		}
	},

	assignCalendarsToWorld: async ({
		prisma,
		worldId,
		calendarsIds,
	}: {
		prisma: Prisma.TransactionClient
		worldId: string
		calendarsIds: string[]
	}) => {
		const world = await prisma.world.findUniqueOrThrow({
			where: {
				id: worldId,
			},
			include: {
				calendars: true,
			},
		})

		const existingCalendarIds = world.calendars.map((c) => c.id)
		const calendarsToRemove = existingCalendarIds.filter((id) => !calendarsIds.includes(id))
		const calendarsToAdd = calendarsIds.filter((id) => !existingCalendarIds.includes(id))

		// Remove unassigned calendars
		for (const existingCalendar of calendarsToRemove) {
			await CalendarService.deleteCalendar({ calendarId: existingCalendar, prisma })
		}

		for (const calendarId of calendarsToAdd) {
			const parsedCalendarId = CalendarTemplateIdShape.safeParse(calendarId)

			if (parsedCalendarId.success) {
				await CalendarTemplateService.createTemplateCalendar({
					worldId,
					templateId: parsedCalendarId.data,
					dbClient: prisma,
				})
				continue
			}

			const existingCalendar = await CalendarService.getEditorCalendar({ calendarId })

			// If owned by the user, make a deep copy. Otherwise, reassign.
			if (existingCalendar.ownerId !== null) {
				await CalendarService.cloneCalendar({
					calendarId,
					worldId,
					prisma,
				})
			} else {
				await prisma.calendar.update({
					where: {
						id: calendarId,
					},
					data: {
						worldId,
					},
				})
			}
		}
	},

	/**
	 * Clone a calendar with all its units, relations, presentations, and seasons.
	 * Creates a deep copy with new IDs, optionally assigning to a different world/owner.
	 */
	cloneCalendar: async ({
		calendarId,
		worldId,
		ownerId,
		name,
		prisma,
	}: {
		calendarId: string
		worldId?: string | null
		ownerId?: string | null
		name?: string
		prisma?: Prisma.TransactionClient
	}) => {
		const tx = getPrismaClient(prisma)
		// 1. Fetch original calendar with all nested relations
		const original = await tx.calendar.findUniqueOrThrow({
			where: { id: calendarId },
			include: {
				units: {
					include: {
						children: true,
					},
					orderBy: { position: 'asc' },
				},
				presentations: {
					include: {
						units: {
							include: {
								unit: true,
							},
						},
					},
				},
				seasons: {
					include: {
						intervals: true,
					},
					orderBy: { position: 'asc' },
				},
			},
		})

		// 2. Create the new calendar (without relations)
		const newCalendar = await tx.calendar.create({
			data: {
				...original,
				id: undefined,
				units: {},
				seasons: {},
				presentations: {},
				worldId: worldId ?? null,
				ownerId: ownerId ?? null,
			},
		})

		if (name) {
			await tx.calendar.update({
				where: { id: newCalendar.id },
				data: { name },
			})
		}

		// 3. Create all units, tracking old ID → new ID
		const unitIdMap = new Map<string, string>()
		for (const unit of original.units) {
			const newUnit = await tx.calendarUnit.create({
				data: {
					...unit,
					id: undefined,
					children: {},
					calendarId: newCalendar.id,
				},
			})
			unitIdMap.set(unit.id, newUnit.id)
		}

		// 4. Create unit relations using the ID map
		for (const unit of original.units) {
			for (const childRel of unit.children) {
				const newParentId = unitIdMap.get(unit.id)
				const newChildId = unitIdMap.get(childRel.childUnitId)
				if (newParentId && newChildId) {
					await tx.calendarUnitRelation.create({
						data: {
							...childRel,
							id: undefined,
							parentUnitId: newParentId,
							childUnitId: newChildId,
						},
					})
				}
			}
		}

		// 5. Create presentations and their units
		for (const presentation of original.presentations) {
			const newPresentation = await tx.calendarPresentation.create({
				data: {
					...presentation,
					id: undefined,
					units: {},
					calendarId: newCalendar.id,
				},
			})

			for (const presUnit of presentation.units) {
				const newUnitId = unitIdMap.get(presUnit.unitId)
				const { unit: _, ...data } = presUnit
				if (newUnitId) {
					await tx.calendarPresentationUnit.create({
						data: {
							...data,
							id: undefined,
							presentationId: newPresentation.id,
							unitId: newUnitId,
						},
					})
				}
			}
		}

		// 6. Create seasons and their intervals
		for (const season of original.seasons) {
			const newSeason = await tx.calendarSeason.create({
				data: {
					...season,
					id: undefined,
					intervals: {},
					calendarId: newCalendar.id,
				},
			})

			for (const interval of season.intervals) {
				await tx.calendarSeasonInterval.create({
					data: {
						id: undefined,
						seasonId: newSeason.id,
						leftIndex: interval.leftIndex,
						rightIndex: interval.rightIndex,
					},
				})
			}
		}

		// Touch the world if assigned
		const world = newCalendar.worldId ? await makeTouchWorldQuery(newCalendar.worldId, tx) : null

		return {
			calendar: newCalendar,
			world,
		}
	},
}
