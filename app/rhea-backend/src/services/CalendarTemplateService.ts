import { Calendar, CalendarUnit } from '@prisma/client'
import { TransactionClient } from 'prisma/client/internal/prismaNamespace.js'
import { z } from 'zod'

import { CalendarService } from './CalendarService.js'
import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const SupportedCalendarTemplates = [
	'earth_current',
	'earth_2023',
	'martian',
	'pf2e_current',
	'pf2e_4723',
	'rimworld',
	'exether',
] as const
export const CalendarTemplateIdShape = z.enum(SupportedCalendarTemplates)

export type CalendarTemplateId = z.infer<typeof CalendarTemplateIdShape>
export type PublicCalendarTemplateId = Exclude<CalendarTemplateId, 'earth_2023' | 'pf2e_4723'>

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
		properties: {
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
	baselineUnit: string
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
	const unitRelationData: {
		to: string
		from: string
		repeats: number
		customLabel?: string
		customLabelShort?: string
	}[] = []
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
				let customLabelShort: string | undefined = undefined
				if (relString.includes(' x')) {
					to = relString.split(' x')[0]
					repeats = Number(relString.split(' x')[1])
				} else {
					to = relString.split(': ')[0]
					repeats = 1
					const customLabelCombined = relString.split(': ')[1]
					if (customLabelCombined) {
						const match = customLabelCombined.match(/\(([^)]+)\)/)
						if (match) {
							customLabelShort = match[1]
							customLabel = customLabelCombined.replace(match[0], '').trim()
						} else {
							customLabel = customLabelCombined
						}
					}
				}
				unitRelationData.push({
					from: name,
					to,
					repeats,
					customLabel,
					customLabelShort,
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
			properties: { compression?: number; baselineUnit: Units[number] },
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
				units,
				compression: properties.compression || 1,
				baselineUnit: properties.baselineUnit,
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
						shortLabel: data.customLabelShort,
					},
				})
			}

			for (const data of presentationCreateData) {
				const baselineUnit = unitNameCache.get(data.baselineUnit)
				if (!baselineUnit) {
					throw new Error(`Invalid baseline unit for presentation ${data.name}.`)
				}
				const parent = await prisma.calendarPresentation.create({
					data: {
						calendarId,
						name: data.name,
						compression: data.compression,
						baselineUnitId: baselineUnit.id,
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
	getSupportedTemplates: (): Record<PublicCalendarTemplateId, { name: string; description: string }> => {
		return {
			earth_current: {
				name: 'Gregorian Calendar (Earth)',
				description: 'Commonly used in many cultures',
			},
			martian: {
				name: 'Darian Calendar (Martian)',
				description: 'A Sol-based Martian calendar',
			},
			pf2e_current: {
				name: 'Golarion Calendar (Pathfinder)',
				description: 'Used in tabletop RPG Pathfinder',
			},
			rimworld: {
				name: 'Quadrum Calendar (RimWorld)',
				description: 'Used in video game RimWorld',
			},
			exether: {
				name: 'Exether Calendar',
				description: 'Used in Victoria 3 mod Realms of Exether',
			},
		}
	},

	getSupportedTemplatesWithLegacy: (): Record<CalendarTemplateId, { name: string; description: string }> => {
		const templates = CalendarTemplateService.getSupportedTemplates()
		return {
			...templates,
			earth_2023: templates.earth_current,
			pf2e_4723: templates.pf2e_current,
		}
	},

	async createTemplateCalendarStandalone(props: {
		ownerId?: string
		worldId?: string
		name?: string
		originTime?: number
		templateId: CalendarTemplateId
	}) {
		return getPrismaClient().$transaction(async (dbClient) => {
			return this.createTemplateCalendar({
				...props,
				dbClient,
			})
		})
	},

	async createTemplateCalendar({
		ownerId,
		worldId,
		name,
		description,
		originTime = 0,
		templateId,
		dbClient,
	}: {
		ownerId?: string
		worldId?: string
		name?: string
		description?: string
		originTime?: number
		templateId: CalendarTemplateId
		dbClient: TransactionClient
	}) {
		const newCalendarName = (() => {
			if (name) {
				return name
			}
			return CalendarTemplateService.getSupportedTemplatesWithLegacy()[templateId].name
		})()

		const newCalendarDescription = (() => {
			if (description) {
				return description
			}
			return 'Copy of ' + CalendarTemplateService.getSupportedTemplatesWithLegacy()[templateId].name
		})()

		const initialCalendar = await dbClient.calendar.create({
			data: {
				name: newCalendarName,
				description: newCalendarDescription,
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
				break
			case 'earth_2023':
				await this.populateEarthCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime: 1063468800 + originTime, // 2023-01-01 00:00
				})
				break
			case 'martian':
				await this.populateMartianCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime,
				})
				break
			case 'pf2e_current':
				await this.populatePf2eCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime: 2485108800 + originTime, // 4726-01-01 00:00
				})
				break
			case 'pf2e_4723':
				await this.populatePf2eCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime: 2483530560 + originTime, // 4723-01-01 00:00
				})
				break
			case 'rimworld':
				await this.populateRimworldCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime: 475113600 + originTime, // 5500-01-01 00:00
				})
				break
			case 'exether':
				await this.populateExetherCalendar({
					prisma: dbClient,
					calendarId: initialCalendar.id,
					originTime: 618631200 + originTime, // 1178-01-01 00:00
				})
				break
		}

		const calendar = await dbClient.calendar.findFirstOrThrow({
			where: {
				id: initialCalendar.id,
			},
		})
		return { calendar }
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
				formatString: 'hh:mm MM DD, YYYY',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Day', ['Hour x24'])
			.createUnit('28-day month', ['Day x28'])
			.createUnit('29-day month', ['Day x29'])
			.createUnit('30-day month', ['Day x30'])
			.createUnit('31-day month', ['Day x31'])
			.createUnit('Regular year', [
				'31-day month: January (Jan)',
				'28-day month: February (Feb)',
				'31-day month: March (Mar)',
				'30-day month: April (Apr)',
				'31-day month: May (May)',
				'30-day month: June (Jun)',
				'31-day month: July (Jul)',
				'31-day month: August (Aug)',
				'30-day month: September (Sep)',
				'31-day month: October (Oct)',
				'30-day month: November (Nov)',
				'31-day month: December (Dec)',
			])
			.createUnit('Leap year', [
				'31-day month: January (Jan)',
				'29-day month: February (Feb)',
				'31-day month: March (Mar)',
				'30-day month: April (Apr)',
				'31-day month: May (May)',
				'30-day month: June (Jun)',
				'31-day month: July (Jul)',
				'31-day month: August (Aug)',
				'30-day month: September (Sep)',
				'31-day month: October (Oct)',
				'30-day month: November (Nov)',
				'31-day month: December (Dec)',
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
			.createPresentation('Minutes', ['Day: MMM DD, YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'], {
				compression: 1,
				baselineUnit: 'Minute',
			})
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
			.createPresentation('Days', ['Month: MMM DD, YYYY', 'Day 5,10,15,20,25: M DD', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: MMM YYYY', 'Month: MMM YYYY', 'Day 5,10,15,20,25: '], {
				compression: 1,
				baselineUnit: 'Day',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Month x6: '], {
				compression: 1,
				baselineUnit: '30-day month',
			})
			.createPresentation('Decades', ['Year x40: YYYY', 'Year x4: YYYY', 'Month x12: '], {
				compression: 6,
				baselineUnit: '30-day month',
			})
			.createPresentation('Centuries', ['Year x400: YYYY', 'Year x100: YYYY', 'Year x20: '], {
				compression: 5,
				baselineUnit: 'Regular year',
			})
			.createPresentation('Millenia', ['Year x10000: YYYY', 'Year x1000: YYYY', 'Year x500: '], {
				compression: 100,
				baselineUnit: 'Regular year',
			})
			.build(prisma, calendarId)
		return calendar
	},

	async populateMartianCalendar({
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
				formatString: 'hh:mm SS MM YYYY',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Sol', ['Hour x24'])
			.createUnit('6-sol week', [
				'Sol: Sol Solis',
				'Sol: Sol Lunae',
				'Sol: Sol Martis',
				'Sol: Sol Mercurii',
				'Sol: Sol Jovis',
				'Sol: Sol Veneris',
			])
			.createUnit('7-sol week', [
				'Sol: Sol Solis',
				'Sol: Sol Lunae',
				'Sol: Sol Martis',
				'Sol: Sol Mercurii',
				'Sol: Sol Jovis',
				'Sol: Sol Veneris',
				'Sol: Sol Saturni',
			])
			.createUnit('27-sol month', ['7-sol week x3', '6-sol week x1'])
			.createUnit('28-sol month', ['7-sol week x4'])
			.createUnit('Regular year', [
				'28-sol month: Sagittarius (Sag)',
				'28-sol month: Dhanus (Dha)',
				'28-sol month: Capricornus (Cap)',
				'28-sol month: Makara (Mak)',
				'28-sol month: Aquarius (Aqu)',
				'27-sol month: Kumbha (Kum)',
				'28-sol month: Pisces (Pis)',
				'28-sol month: Mina (Min)',
				'28-sol month: Aries (Ari)',
				'28-sol month: Mesha (Mes)',
				'28-sol month: Taurus (Tau)',
				'27-sol month: Rishabha (Ris)',
				'28-sol month: Gemini (Gem)',
				'28-sol month: Mithuna (Mit)',
				'28-sol month: Cancer (Can)',
				'28-sol month: Karka (Kar)',
				'28-sol month: Leo (Leo)',
				'27-sol month: Simha (Sim)',
				'28-sol month: Virgo (Vir)',
				'28-sol month: Kanya (Kan)',
				'28-sol month: Libra (Lib)',
				'28-sol month: Tula (Tul)',
				'28-sol month: Scorpius (Sco)',
				'27-sol month: Vrishika (Vri)',
			])
			.createUnit('Leap year', [
				'28-sol month: Sagittarius (Sag)',
				'28-sol month: Dhanus (Dha)',
				'28-sol month: Capricornus (Cap)',
				'28-sol month: Makara (Mak)',
				'28-sol month: Aquarius (Aqu)',
				'27-sol month: Kumbha (Kum)',
				'28-sol month: Pisces (Pis)',
				'28-sol month: Mina (Min)',
				'28-sol month: Aries (Ari)',
				'28-sol month: Mesha (Mes)',
				'28-sol month: Taurus (Tau)',
				'27-sol month: Rishabha (Ris)',
				'28-sol month: Gemini (Gem)',
				'28-sol month: Mithuna (Mit)',
				'28-sol month: Cancer (Can)',
				'28-sol month: Karka (Kar)',
				'28-sol month: Leo (Leo)',
				'27-sol month: Simha (Sim)',
				'28-sol month: Virgo (Vir)',
				'28-sol month: Kanya (Kan)',
				'28-sol month: Libra (Lib)',
				'28-sol month: Tula (Tul)',
				'28-sol month: Scorpius (Sco)',
				'28-sol month: Vrishika (Vri)',
			])
			.createUnit('10-year cycle', [
				'Leap year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
			])
			.createUnit('200-year cycle', [
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'Regular year x1',
				'Leap year x1',
				'10-year cycle x19',
			])
			.defineBuckets('Minute', 'Hour', 'Week', 'Sol', 'Month', 'Year')
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
			.updateUnits(['Sol'], {
				formatMode: 'NumericOneIndexed',
				formatShorthand: 's',
				displayName: 'Sol',
				displayNameShort: 'Sol',
				displayNamePlural: 'Sols',
			})
			.updateUnits(['6-sol week', '7-sol week'], {
				formatMode: 'Hidden',
				formatShorthand: 'W',
				displayName: 'Week',
				displayNameShort: 'Wk',
				displayNamePlural: 'Weeks',
			})
			.updateUnits(['27-sol month', '28-sol month'], {
				formatMode: 'Name',
				formatShorthand: 'M',
				displayName: 'Month',
				displayNameShort: 'Mon',
				displayNamePlural: 'Months',
			})
			.updateUnits(['Leap year', 'Regular year'], {
				formatMode: 'Numeric',
				formatShorthand: 'Y',
				displayName: 'Year',
				displayNameShort: 'Yr',
				displayNamePlural: 'Years',
			})
			.updateUnits(['10-year cycle', '200-year cycle'], {
				formatMode: 'Hidden',
			})
			.createPresentation('Minutes', ['Sol: SS MMM YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'], {
				compression: 1,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 0', ['Sol: SS MMM YYYY', 'Hour: hh:mm', 'Minute x30: '], {
				compression: 5,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 1', ['Sol: SS MMM YYYY', 'Hour x6: hh:mm', 'Minute x60: '], {
				compression: 20,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 2', ['Month: SS MMM YYYY', 'Sol: SS MMM', 'Hour x6: hh:mm'], {
				compression: 1,
				baselineUnit: 'Hour',
			})
			.createPresentation('Days', ['Month: SS MMM YYYY', 'Sol 7,14,21: SS M', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: MMM YYYY', 'Month: MMM YYYY', 'Sol 7,14,21: '], {
				compression: 1,
				baselineUnit: 'Sol',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Month x6: '], {
				compression: 1,
				baselineUnit: '28-sol month',
			})
			.createPresentation('Decades', ['Year x40: YYYY', 'Year x4: YYYY', 'Month x12: '], {
				compression: 6,
				baselineUnit: '28-sol month',
			})
			.createPresentation('Centuries', ['Year x400: YYYY', 'Year x100: YYYY', 'Year x20: '], {
				compression: 5,
				baselineUnit: 'Regular year',
			})
			.createPresentation('Millenia', ['Year x4000: YYYY', 'Year x1000: YYYY', 'Year x200: '], {
				compression: 100,
				baselineUnit: 'Regular year',
			})
			.build(prisma, calendarId)
		return calendar
	},

	async populatePf2eCalendar({
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
				formatString: 'hh:mm MM DD, YYYY',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Day', ['Hour x24'])
			.createUnit('28-day month', ['Day x28'])
			.createUnit('29-day month', ['Day x29'])
			.createUnit('30-day month', ['Day x30'])
			.createUnit('31-day month', ['Day x31'])
			.createUnit('Regular year', [
				'31-day month: Abadius (Aba)',
				'28-day month: Calistril (Cal)',
				'31-day month: Pharast (Pha)',
				'30-day month: Gozran (Goz)',
				'31-day month: Desnus (Des)',
				'30-day month: Sarenith (Sar)',
				'31-day month: Erastus (Era)',
				'31-day month: Arodus (Aro)',
				'30-day month: Rova (Rov)',
				'31-day month: Lamashan (Lam)',
				'30-day month: Neth (Net)',
				'31-day month: Kuthona (Kut)',
			])
			.createUnit('Leap year', [
				'31-day month: Abadius (Aba)',
				'29-day month: Calistril (Cal)',
				'31-day month: Pharast (Pha)',
				'30-day month: Gozran (Goz)',
				'31-day month: Desnus (Des)',
				'30-day month: Sarenith (Sar)',
				'31-day month: Erastus (Era)',
				'31-day month: Arodus (Aro)',
				'30-day month: Rova (Rov)',
				'31-day month: Lamashan (Lam)',
				'30-day month: Neth (Net)',
				'31-day month: Kuthona (Kut)',
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
			.createPresentation('Minutes', ['Day: DD MMM, YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'], {
				compression: 1,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 0', ['Day: DD MMM, YYYY', 'Hour: hh:mm', 'Minute x30: '], {
				compression: 5,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 1', ['Day: DD MMM, YYYY', 'Hour x6: hh:mm', 'Minute x60: '], {
				compression: 20,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 2', ['Month: DD MMM, YYYY', 'Day: DD MMM', 'Hour x6: hh:mm'], {
				compression: 1,
				baselineUnit: 'Hour',
			})
			.createPresentation('Days', ['Month: DD MMM, YYYY', 'Day 5,10,15,20,25: DD M', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: MMM YYYY', 'Month: MMM YYYY', 'Day 5,10,15,20,25: '], {
				compression: 1,
				baselineUnit: 'Day',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Month x6: '], {
				compression: 1,
				baselineUnit: '30-day month',
			})
			.createPresentation('Decades', ['Year x40: YYYY', 'Year x4: YYYY', 'Month x12: '], {
				compression: 6,
				baselineUnit: '30-day month',
			})
			.createPresentation('Centuries', ['Year x400: YYYY', 'Year x100: YYYY', 'Year x20: '], {
				compression: 5,
				baselineUnit: 'Regular year',
			})
			.createPresentation('Millenia', ['Year x10000: YYYY', 'Year x1000: YYYY', 'Year x500: '], {
				compression: 100,
				baselineUnit: 'Regular year',
			})
			.build(prisma, calendarId)
		return calendar
	},

	async populateRimworldCalendar({
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
				formatString: 'hh:mm QQQ DD, YYYY',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Day', ['Hour x24'])
			.createUnit('Quadrum', ['Day x15'])
			.createUnit('Year', ['Quadrum: Aprimay', 'Quadrum: Jugust', 'Quadrum: Septober', 'Quadrum: Decembary'])
			.defineBuckets('Minute', 'Hour', 'Day', 'Quadrum', 'Year')
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
			.updateUnits(['Quadrum'], {
				formatMode: 'Name',
				formatShorthand: 'Q',
				displayName: 'Quadrum',
				displayNameShort: 'Qd',
				displayNamePlural: 'Quadrums',
			})
			.updateUnits(['Year'], {
				formatMode: 'NumericOneIndexed',
				formatShorthand: 'Y',
				displayName: 'Year',
				displayNameShort: 'Yr',
				displayNamePlural: 'Years',
			})
			.createPresentation('Minutes', ['Day: QQQ DD, YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'], {
				compression: 1,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 0', ['Day: QQQ DD, YYYY', 'Hour: hh:mm', 'Minute x30: '], {
				compression: 5,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 1', ['Day: QQQ DD, YYYY', 'Hour x6: hh:mm', 'Minute x60: '], {
				compression: 20,
				baselineUnit: 'Minute',
			})
			.createPresentation('Hours 2', ['Quadrum: QQQ DD, YYYY', 'Day: QQQ DD', 'Hour x6: hh:mm'], {
				compression: 1,
				baselineUnit: 'Hour',
			})
			.createPresentation('Days', ['Quadrum: QQQ DD, YYYY', 'Day 5,10: Q DD', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: QQQ YYYY', 'Quadrum: QQQ YYYY', 'Day 5,10: '], {
				compression: 1,
				baselineUnit: 'Day',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Quadrum: '], {
				compression: 1,
				baselineUnit: 'Quadrum',
			})
			.createPresentation('Decades', ['Year x200: YYYY', 'Year x20: YYYY', 'Year x4: '], {
				compression: 4,
				baselineUnit: 'Quadrum',
			})
			.createPresentation('Centuries', ['Year x400: YYYY', 'Year x100: YYYY', 'Year x20: '], {
				compression: 5,
				baselineUnit: 'Year',
			})
			.createPresentation('Millenia', ['Year x10000: YYYY', 'Year x1000: YYYY', 'Year x500: '], {
				compression: 100,
				baselineUnit: 'Year',
			})
			.build(prisma, calendarId)
		return calendar
	},

	async populateExetherCalendar({
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
				formatString: 'hh:mm MM DD, YYYY',
			})
			.createUnit('Minute', [])
			.createUnit('Hour', ['Minute x60'])
			.createUnit('Day', ['Hour x24'])
			.createUnit('28-day month', ['Day x28'])
			.createUnit('30-day month', ['Day x30'])
			.createUnit('31-day month', ['Day x31'])
			.createUnit('Year', [
				'31-day month: Frostmoot',
				'28-day month: Deepsnow',
				'31-day month: Winterwane',
				'30-day month: Rainmoot',
				'31-day month: Palesun',
				'30-day month: Highsun',
				'31-day month: Firemoot',
				'31-day month: Firewane',
				'30-day month: Lowsun',
				'31-day month: Redfall',
				'30-day month: Snowmoot',
				'31-day month: Fellnight',
			])
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
			.updateUnits(['28-day month', '30-day month', '31-day month'], {
				formatMode: 'Name',
				formatShorthand: 'M',
				displayName: 'Month',
				displayNameShort: 'Mon',
				displayNamePlural: 'Months',
			})
			.updateUnits(['Year'], {
				formatMode: 'NumericOneIndexed',
				formatShorthand: 'Y',
				displayName: 'Year',
				displayNameShort: 'Yr',
				displayNamePlural: 'Years',
			})
			.createPresentation('Minutes', ['Day: MMM DD, YYYY', 'Hour: hh:mm', 'Minute x10: hh:mm'], {
				compression: 1,
				baselineUnit: 'Minute',
			})
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
			.createPresentation('Days', ['Month: MMM DD, YYYY', 'Day 5,10,15,20,25: M DD', 'Hour x24: '], {
				compression: 4,
				baselineUnit: 'Hour',
			})
			.createPresentation('Quarters', ['Year: MMM YYYY', 'Month: MMM YYYY', 'Day 5,10,15,20,25: '], {
				compression: 1,
				baselineUnit: 'Day',
			})
			.createPresentation('Years', ['Year x4: YYYY', 'Year: YYYY', 'Month x6: '], {
				compression: 1,
				baselineUnit: '30-day month',
			})
			.createPresentation('Decades', ['Year x40: YYYY', 'Year x4: YYYY', 'Month x12: '], {
				compression: 6,
				baselineUnit: '30-day month',
			})
			.createPresentation('Centuries', ['Year x400: YYYY', 'Year x100: YYYY', 'Year x20: '], {
				compression: 5,
				baselineUnit: 'Year',
			})
			.createPresentation('Millenia', ['Year x10000: YYYY', 'Year x1000: YYYY', 'Year x500: '], {
				compression: 100,
				baselineUnit: 'Year',
			})
			.build(prisma, calendarId)
		return calendar
	},
}
