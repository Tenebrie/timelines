import { Calendar, CalendarUnit } from '@prisma/client'
import { TransactionClient } from 'prisma/client/internal/prismaNamespace.js'
import { z } from 'zod'

import { CalendarService } from './CalendarService.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const SupportedCalendarTemplates = [
	'earth_current',
	'earth_2023',
	'pf2e_current',
	'pf2e_4723',
	'rimworld',
	'exether',
] as const
export const CalendarTemplateIdShape = z.enum(SupportedCalendarTemplates)

export type CalendarTemplateId = z.infer<typeof CalendarTemplateIdShape>

type CalendarMetadata = { formatString: string; originTime: number }
type CommaSeparatedNumbers =
	| `${number},${number}`
	| `${number},${number},${number}`
	| `${number},${number},${number},${number}`
	| `${number},${number},${number},${number},${number}`
type RelationString<Units extends string[]> = `${Units[number]} x${number}` | `${Units[number]}: ${string}`
type PresentationString<Buckets extends string[]> =
	| `${Buckets[number]}: ${string}`
	| `${Buckets[number]} x${number}: ${string}`
	| `${Buckets[number]} ${CommaSeparatedNumbers}: ${string}`
type TemplateBuilder<Units extends string[], Buckets extends string[]> = {
	setMetadata: (metadata: CalendarMetadata) => TemplateBuilder<Units, Buckets>

	defineBuckets: <NewBuckets extends string[]>(
		...names: NewBuckets
	) => TemplateBuilder<Units, [...Buckets, ...NewBuckets]>

	createUnit: <NewUnit extends string>(
		name: NewUnit,
		relations: RelationString<Units>[],
	) => TemplateBuilder<[...Units, NewUnit], Buckets>

	updateUnits: (
		name: Units[number][],
		updates: {
			formatMode?: CalendarUnit['formatMode']
			formatShorthand?: string
			displayName?: Buckets[number]
			displayNameShort?: string
			displayNamePlural?: string
		},
	) => TemplateBuilder<Units, Buckets>

	createPresentation: (
		name: string,
		relations: PresentationString<Buckets>[],
		properties?: {
			compression: number
			baselineUnit: Units[number]
		},
	) => TemplateBuilder<Units, Buckets>

	build: (prisma: TransactionClient, calendarId: string) => Promise<Calendar>
}

type CalendarUnitCreateData = {
	name: string
	formatMode?: CalendarUnit['formatMode']
	formatShorthand?: string
	displayName?: string
	displayNameShort?: string
	displayNamePlural?: string
}

type CalendarPresentationCreateData = {
	name: string
	compression: number
	units: {
		name: string
		formatString: string
		subdivision: number
		labeledIndices: number[]
	}[]
}

function makeCalendarBuilder<Units extends never[], Buckets extends never[]>() {
	const calendarMetadata = {
		originTime: 0 as number,
		formatString: '',
	}
	const unitCreateData: CalendarUnitCreateData[] = []
	const unitRelationData: { to: string; from: string; repeats: number; customLabel?: string }[] = []
	const presentationCreateData: CalendarPresentationCreateData[] = []

	const builder: TemplateBuilder<Units, Buckets> = {
		setMetadata: (metadata: CalendarMetadata) => {
			calendarMetadata.originTime = metadata.originTime
			calendarMetadata.formatString = metadata.formatString
			return builder
		},

		createUnit: <NewUnit extends string>(name: NewUnit, relations: RelationString<Units>[]) => {
			unitCreateData.push({
				name,
			})

			for (const relation of relations) {
				const relString = relation as string

				let to: string
				let repeats: number
				let customLabel: string | undefined = undefined
				if (relString.includes(' x')) {
					to = relString.split(' x')[0]
					repeats = Number(relString.split(' x')[1])
				} else {
					to = relString.split(': ')[0]
					customLabel = relString.split(': ')[1]
					repeats = 1
				}
				unitRelationData.push({
					from: name,
					to,
					repeats,
					customLabel,
				})
			}
			return builder as TemplateBuilder<[...Units, NewUnit], Buckets>
		},

		defineBuckets: <NewBuckets extends string[]>() => {
			return builder as TemplateBuilder<Units, [...Buckets, ...NewBuckets]>
		},

		updateUnits: (names: Units[number][], updates: Omit<CalendarUnitCreateData, 'name'>) => {
			for (const name of names) {
				const index = unitCreateData.findIndex((unit) => unit.name === name)
				if (index !== -1) {
					unitCreateData[index] = { ...unitCreateData[index], ...updates }
				}
			}
			return builder as TemplateBuilder<Units, Buckets>
		},

		createPresentation: (
			name: string,
			relations: PresentationString<Buckets>[],
			properties: { compression?: number } = {},
		) => {
			const units = relations.map((relation) => {
				const relString = String(relation)
				const [unitAndSubdivision, formatString] = relString.split(': ')
				const [unitNameAndIndices, subdivision] = unitAndSubdivision.split(' x')
				const [unitName, indicesString] = unitNameAndIndices.split(' ')
				const labeledIndices = indicesString?.split(',').map((i) => Number(i.trim())) ?? []
				return {
					name: unitName,
					formatString,
					subdivision: Number(subdivision) || 1,
					labeledIndices,
				}
			})
			presentationCreateData.push({
				name,
				compression: properties.compression || 1,
				units,
			})
			return builder
		},

		build: async (prisma: TransactionClient, calendarId: string) => {
			await prisma.calendar.update({
				where: {
					id: calendarId,
				},
				data: {
					originTime: calendarMetadata.originTime,
					dateFormat: calendarMetadata.formatString,
				},
			})

			const unitNameCache: Map<string, CalendarUnit> = new Map()
			const unitBucketCache: Map<string, CalendarUnit[]> = new Map()
			const unitsToCreate = unitCreateData.slice().reverse()
			for (let i = 0; i < unitsToCreate.length; i++) {
				const data = unitsToCreate[i]
				const displayName = data.displayName ?? data.name
				const unit = await prisma.calendarUnit.create({
					data: {
						...data,
						calendarId,
						position: i,
					},
				})
				unitNameCache.set(data.name, unit)
				unitBucketCache.set(displayName, [...(unitBucketCache.get(displayName) ?? []), unit])
			}

			for (const data of unitRelationData) {
				const parentId = unitNameCache.get(data.from)?.id
				const childId = unitNameCache.get(data.to)?.id
				if (!parentId || !childId) {
					throw new Error(`Invalid relation from ${data.from} to ${data.to}. One of the units was not found.`)
				}
				await prisma.calendarUnitRelation.create({
					data: {
						parentUnitId: parentId,
						childUnitId: childId,
						repeats: data.repeats,
						label: data.customLabel,
					},
				})
			}

			for (const data of presentationCreateData) {
				const parent = await prisma.calendarPresentation.create({
					data: {
						calendarId,
						name: data.name,
						compression: data.compression,
					},
				})

				for (const unit of data.units) {
					const unitId = unitBucketCache.get(unit.name)?.[0]?.id
					if (!unitId) {
						throw new Error(
							`Invalid presentation relation from ${data.name} to ${unit.name}. Unit not found.`,
						)
					}
					await prisma.calendarPresentationUnit.create({
						data: {
							presentationId: parent.id,
							unitId,
							name: unit.name,
							formatString: unit.formatString,
							subdivision: unit.subdivision,
							labeledIndices: unit.labeledIndices,
						},
					})
				}
			}

			await CalendarService.computeCalendarUnitDurations({ calendarId }, prisma)
			await CalendarService.computeCalendarPresentationFactors({ calendarId, dbClient: prisma })

			return prisma.calendar.findUniqueOrThrow({
				where: {
					id: calendarId,
				},
			})
		},
	} satisfies TemplateBuilder<Units, Buckets>
	return builder
}

export const CalendarTemplateService = {
	async createTemplateCalendar({
		ownerId,
		worldId,
		name,
		originTime = 0,
		templateId,
	}: {
		ownerId?: string
		worldId?: string
		name?: string
		originTime?: number
		templateId: CalendarTemplateId
	}) {
		return getPrismaClient().$transaction(async (dbClient) => {
			const newCalendarName = (() => {
				if (name) {
					return name
				}
				switch (templateId) {
					case 'earth_current':
					case 'earth_2023':
						return 'Earth Calendar'
					case 'pf2e_current':
					case 'pf2e_4723':
						return 'Golarion Calendar (Pathfinder)'
					case 'rimworld':
						return 'Quadrums Calendar (Rimworld)'
					case 'exether':
						return 'Exether Calendar'
					default:
						throw new Error(`No name specified for template: ${templateId}`)
				}
			})()

			const initialCalendar = await dbClient.calendar.create({
				data: {
					name: newCalendarName,
					ownerId,
					worldId,
					position: 0,
				},
			})

			switch (templateId) {
				case 'earth_current':
					await this.populateEarthCalendar({
						prisma: dbClient,
						calendarId: initialCalendar.id,
						originTime: 1065047040 + originTime, // 2026-01-01 00:00
					})
				case 'earth_2023':
					await this.populateEarthCalendar({
						prisma: dbClient,
						calendarId: initialCalendar.id,
						originTime: 1063468800 + originTime, // 2023-01-01 00:00
					})
			}

			const calendar = await dbClient.calendar.findFirstOrThrow({
				where: {
					id: initialCalendar.id,
				},
			})
			return { calendar }
		})
	},

	async populateEarthCalendar({
		prisma,
		calendarId,
		originTime,
	}: {
		prisma: TransactionClient
		calendarId: string
		originTime: number
	}) {
		const builder = makeCalendarBuilder()
		const calendar = await builder
			.setMetadata({
				originTime,
				formatString: 'YYYY-MM-DD hh:mm',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Day', ['Hour x24'])
			.createUnit('28-day month', ['Day x28'])
			.createUnit('29-day month', ['Day x29'])
			.createUnit('30-day month', ['Day x30'])
			.createUnit('31-day month', ['Day x31'])
			.createUnit('Regular year', [
				'31-day month: January',
				'28-day month: February',
				'31-day month: March',
				'30-day month: April',
				'31-day month: May',
				'30-day month: June',
				'31-day month: July',
				'31-day month: August',
				'30-day month: September',
				'31-day month: October',
				'30-day month: November',
				'31-day month: December',
			])
			.createUnit('Leap year', [
				'31-day month: January',
				'29-day month: February',
				'31-day month: March',
				'30-day month: April',
				'31-day month: May',
				'30-day month: June',
				'31-day month: July',
				'31-day month: August',
				'30-day month: September',
				'31-day month: October',
				'30-day month: November',
				'31-day month: December',
			])
			.createUnit('4-year cycle', ['Regular year x3', 'Leap year x1'])
			.createUnit('100-year cycle', ['4-year cycle x24', 'Regular year x4'])
			.createUnit('400-year cycle', ['100-year cycle x3', '4-year cycle x25'])
			.defineBuckets('Minute', 'Hour', 'Day', 'Month', 'Year')
			.updateUnits(['Minute'], {
				formatMode: 'Numeric',
				formatShorthand: 'm',
				displayName: 'Minute',
				displayNameShort: 'min',
				displayNamePlural: 'Minutes',
			})
			.updateUnits(['Hour'], {
				formatMode: 'Numeric',
				formatShorthand: 'h',
				displayName: 'Hour',
				displayNameShort: 'hr',
				displayNamePlural: 'Hours',
			})
			.updateUnits(['Day'], {
				formatMode: 'NumericOneIndexed',
				formatShorthand: 'd',
				displayName: 'Day',
				displayNameShort: 'd',
				displayNamePlural: 'Days',
			})
			.updateUnits(['28-day month', '29-day month', '30-day month', '31-day month'], {
				formatMode: 'Name',
				formatShorthand: 'M',
				displayName: 'Month',
				displayNameShort: 'Mon',
				displayNamePlural: 'Months',
			})
			.updateUnits(['Leap year', 'Regular year'], {
				formatMode: 'NumericOneIndexed',
				formatShorthand: 'Y',
				displayName: 'Year',
				displayNameShort: 'Yr',
				displayNamePlural: 'Years',
			})
			.updateUnits(['4-year cycle', '100-year cycle', '400-year cycle'], {
				formatMode: 'Hidden',
			})
			.createPresentation('Minutes', ['Day: MMM DD, YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'])
			.createPresentation('Hours 0', ['Day: MMM DD, YYYY', 'Hour: hh:mm', 'Minute x30: '], {
				compression: 5,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 1', ['Day: MMM DD, YYYY', 'Hour x6: hh:mm', 'Minute x60: '], {
				compression: 20,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 2', ['Month: MMM DD, YYYY', 'Day: MMM DD', 'Hour x6: hh:mm'], {
				compression: 1,
				baselineUnit: 'Hour',
			})
			.createPresentation('Days', ['Month: MMM DD, YYYY', 'Day 4,9,14,19,24: M DD', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: MMM YYYY', 'Month: MMM YYYY', 'Day 4,9,14,19,24: '], {
				compression: 1,
				baselineUnit: 'Day',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Day x365: '], {
				compression: 182,
				baselineUnit: 'Day',
			})
			.createPresentation('Decades', ['Year x10: YYYY', 'Year x4: YYYY', 'Year x4: '], {
				compression: 1 * 365,
				baselineUnit: 'Day',
			})
			.createPresentation('Centuries', ['Year x1000: YYYY', 'Year x100: YYYY', 'Year x10: YYYY'], {
				compression: 10 * 365,
				baselineUnit: 'Day',
			})
			.createPresentation('Millenia', ['Year x10000: YYYY', 'Year x1000: YYYY', 'Year x100: YYYY'], {
				compression: 100 * 365,
				baselineUnit: 'Day',
			})
			.build(prisma, calendarId)
		return calendar
	},
}
