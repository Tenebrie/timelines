import { CalendarUnit } from '@api/types/calendarTypes'

import {
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { parseTimestampMultiRoot } from './parseTimestampMultiRoot'

describe('parseTimestampMultiRoot', () => {
	describe('basic single-root parsing', () => {
		it('parses timestamp 0 for a single root unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 0 })

			expect(result.get('day')?.value).toBe(0)
		})

		it('parses timestamp 5 for a simple day unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 5 })

			expect(result.get('day')?.value).toBe(5)
		})

		it('parses timestamp with duration > 1', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 100,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const result99 = parseTimestampMultiRoot({ allUnits: units, timestamp: 99 })
			expect(result99.get('day')?.value).toBe(0)

			const result100 = parseTimestampMultiRoot({ allUnits: units, timestamp: 100 })
			expect(result100.get('day')?.value).toBe(1)
		})

		it('handles very large timestamps', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 1000000 })

			expect(result.get('day')?.value).toBe(1000000)
		})

		it('returns empty map for empty units array', () => {
			const result = parseTimestampMultiRoot({ allUnits: [], timestamp: 5 })

			expect(result.size).toBe(0)
		})
	})

	describe('hierarchical calendar (days in months in years)', () => {
		const createSimpleCalendar = () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 2,
				children: [],
				parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				displayName: 'Month',
				displayNameShort: 'M',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
				position: 1,
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
				parents: [mockCalendarUnitParentRelation('year', 'month', 12)],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				displayNameShort: 'Y',
				duration: 360, // 12 months * 30 days
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [mockCalendarUnitChildRelation('year', 'month', 12)],
				parents: [],
			})

			return [yearUnit, monthUnit, dayUnit]
		}

		it('parses timestamp 0 into year 0, month 0, day 0', () => {
			const units = createSimpleCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 0 })

			expect(result.get('year')?.value).toBe(0)
			expect(result.get('month')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(0)
		})

		it('parses timestamp 14 into year 0, month 0, day 14', () => {
			const units = createSimpleCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 14 })

			expect(result.get('year')?.value).toBe(0)
			expect(result.get('month')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(14)
		})

		it('parses timestamp 30 into year 0, month 1, day 0', () => {
			const units = createSimpleCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 30 })

			expect(result.get('year')?.value).toBe(0)
			expect(result.get('month')?.value).toBe(1)
			expect(result.get('day')?.value).toBe(0)
		})

		it('parses timestamp 359 into year 0, month 11, day 29', () => {
			const units = createSimpleCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 359 })

			expect(result.get('year')?.value).toBe(0)
			expect(result.get('month')?.value).toBe(11)
			expect(result.get('day')?.value).toBe(29)
		})

		it('parses timestamp 360 into year 1, month 0, day 0', () => {
			const units = createSimpleCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 360 })

			expect(result.get('year')?.value).toBe(1)
			expect(result.get('month')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(0)
		})

		it('parses large timestamp correctly', () => {
			const units = createSimpleCalendar()
			// Year 100, month 5, day 14 = 100*360 + 5*30 + 14 = 36164
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 36164 })

			expect(result.get('year')?.value).toBe(100)
			expect(result.get('month')?.value).toBe(5)
			expect(result.get('day')?.value).toBe(14)
		})
	})

	describe('Hidden format mode', () => {
		it('hidden units pass their count to children', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('week', 'day', 7)],
			})

			const weekUnit = mockCalendarUnit({
				id: 'week',
				name: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('week', 'day', 7)],
				parents: [mockCalendarUnitParentRelation('month', 'week', 4)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 28,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('month', 'week', 4)],
				parents: [],
			})

			const result = parseTimestampMultiRoot({ allUnits: [monthUnit, weekUnit, dayUnit], timestamp: 10 })

			// Day 10 is in week 2 (hidden), should show as day 10 of month
			expect(result.get('month')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(10)
		})

		it('multiple hidden levels accumulate correctly', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('week', 'day', 7)],
			})

			const weekUnit = mockCalendarUnit({
				id: 'week',
				name: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('week', 'day', 7)],
				parents: [mockCalendarUnitParentRelation('fortnight', 'week', 2)],
			})

			const fortnightUnit = mockCalendarUnit({
				id: 'fortnight',
				name: 'Fortnight',
				duration: 14,
				formatShorthand: 'f',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('fortnight', 'week', 2)],
				parents: [mockCalendarUnitParentRelation('month', 'fortnight', 2)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 28,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('month', 'fortnight', 2)],
				parents: [],
			})

			const result = parseTimestampMultiRoot({
				allUnits: [monthUnit, fortnightUnit, weekUnit, dayUnit],
				timestamp: 20,
			})

			// Day 20 should show as day 20 of month 0
			expect(result.get('month')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(20)
		})
	})

	describe('custom labels on child relations', () => {
		it('propagates custom label from child relation', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
				displayName: 'Day',
				displayNameShort: 'D',
				children: [],
				parents: [mockCalendarUnitParentRelation('month', 'day', 30, { label: 'Festival Day' })],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('month', 'day', 30, { label: 'Festival Day' })],
				parents: [],
			})

			const result = parseTimestampMultiRoot({ allUnits: [monthUnit, dayUnit], timestamp: 5 })

			expect(result.get('day')?.customLabel).toBe('Festival Day')
		})
	})

	describe('multiple root units', () => {
		it('parses independent roots from same timestamp', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [],
			})

			const result = parseTimestampMultiRoot({ allUnits: [hourUnit, dayUnit], timestamp: 10 })

			// Both are roots with duration 1, so both show timestamp value
			expect(result.get('day')?.value).toBe(10)
			expect(result.get('hour')?.value).toBe(10)
		})

		it('deduplicates by format shorthand, keeping first by position', () => {
			const rootA = mockCalendarUnit({
				id: 'root-a',
				name: 'Root A',
				duration: 1,
				formatShorthand: 'x',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [],
			})

			const rootB = mockCalendarUnit({
				id: 'root-b',
				name: 'Root B',
				duration: 2,
				formatShorthand: 'x',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const result = parseTimestampMultiRoot({ allUnits: [rootA, rootB], timestamp: 10 })

			// Root A (position 0) should win, duration 1 means value = 10
			expect(result.get('root-a')?.value).toBe(10)
			expect(result.has('root-b')).toBe(false)
		})
	})

	describe('units with null formatShorthand', () => {
		it('skips units with null formatShorthand in combined map', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: null,
					formatMode: 'Numeric',
				}),
			]

			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 5 })

			// Unit with null formatShorthand should not appear in combined map
			expect(result.has('day')).toBe(false)
		})
	})

	describe('complex calendar with multiple unit types', () => {
		const createComplexCalendar = () => {
			const secondUnit = mockCalendarUnit({
				id: 'second',
				name: 'Second',
				displayName: 'Second',
				displayNameShort: 'S',
				duration: 1,
				formatShorthand: 's',
				formatMode: 'Numeric',
				position: 3,
				children: [],
				parents: [mockCalendarUnitParentRelation('minute', 'second', 60)],
			})

			const minuteUnit = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				displayName: 'Minute',
				displayNameShort: 'M',
				duration: 60,
				formatShorthand: 'i',
				formatMode: 'Numeric',
				position: 2,
				children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
				parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				displayName: 'Hour',
				displayNameShort: 'H',
				duration: 3600,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 1,
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
				parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 86400,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 0,
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
				parents: [],
			})

			return [dayUnit, hourUnit, minuteUnit, secondUnit]
		}

		it('parses midnight of day 1 (timestamp 0)', () => {
			const units = createComplexCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 0 })

			expect(result.get('day')?.value).toBe(0)
			expect(result.get('hour')?.value).toBe(0)
			expect(result.get('minute')?.value).toBe(0)
			expect(result.get('second')?.value).toBe(0)
		})

		it('parses noon of day 1 (timestamp 43200)', () => {
			const units = createComplexCalendar()
			// 12 hours * 3600 = 43200
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 43200 })

			expect(result.get('day')?.value).toBe(0)
			expect(result.get('hour')?.value).toBe(12)
			expect(result.get('minute')?.value).toBe(0)
			expect(result.get('second')?.value).toBe(0)
		})

		it('parses 23:59:59 (timestamp 86399)', () => {
			const units = createComplexCalendar()
			// 23*3600 + 59*60 + 59 = 86399
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 86399 })

			expect(result.get('day')?.value).toBe(0)
			expect(result.get('hour')?.value).toBe(23)
			expect(result.get('minute')?.value).toBe(59)
			expect(result.get('second')?.value).toBe(59)
		})

		it('parses first second of day 2 (timestamp 86400)', () => {
			const units = createComplexCalendar()
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 86400 })

			expect(result.get('day')?.value).toBe(1)
			expect(result.get('hour')?.value).toBe(0)
			expect(result.get('minute')?.value).toBe(0)
			expect(result.get('second')?.value).toBe(0)
		})

		it('parses arbitrary time (Day 5, 14:30:45 = timestamp 397845)', () => {
			const units = createComplexCalendar()
			// 4*86400 + 14*3600 + 30*60 + 45 = 397845
			const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 397845 })

			expect(result.get('day')?.value).toBe(4)
			expect(result.get('hour')?.value).toBe(14)
			expect(result.get('minute')?.value).toBe(30)
			expect(result.get('second')?.value).toBe(45)
		})
	})

	describe('non-standard duration ratios', () => {
		it('handles 13-hour days', () => {
			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('day', 'hour', 13)],
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 13,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [mockCalendarUnitChildRelation('day', 'hour', 13)],
				parents: [],
			})

			// Hour 14 is hour 1 of day 2
			const result = parseTimestampMultiRoot({ allUnits: [dayUnit, hourUnit], timestamp: 14 })

			expect(result.get('day')?.value).toBe(1)
			expect(result.get('hour')?.value).toBe(1)
		})

		it('handles prime number durations (7 hours/day, 11 days/week)', () => {
			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('day', 'hour', 7)],
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 7,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('day', 'hour', 7)],
				parents: [mockCalendarUnitParentRelation('week', 'day', 11)],
			})

			const weekUnit = mockCalendarUnit({
				id: 'week',
				name: 'Week',
				duration: 77, // 7 * 11
				formatShorthand: 'w',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('week', 'day', 11)],
				parents: [],
			})

			// Week 0, day 5, hour 3 = 5*7 + 3 = 38
			const result = parseTimestampMultiRoot({ allUnits: [weekUnit, dayUnit, hourUnit], timestamp: 38 })

			expect(result.get('week')?.value).toBe(0)
			expect(result.get('day')?.value).toBe(5)
			expect(result.get('hour')?.value).toBe(3)
		})
	})

	describe('deeply nested hierarchy (5 levels)', () => {
		it('parses correctly through 5 levels', () => {
			const tickUnit = mockCalendarUnit({
				id: 'tick',
				name: 'Tick',
				duration: 1,
				formatShorthand: 't',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('second', 'tick', 10)],
			})

			const secondUnit = mockCalendarUnit({
				id: 'second',
				name: 'Second',
				duration: 10,
				formatShorthand: 's',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('second', 'tick', 10)],
				parents: [mockCalendarUnitParentRelation('minute', 'second', 60)],
			})

			const minuteUnit = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 600,
				formatShorthand: 'i',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
				parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 36000,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
				parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 864000,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
				parents: [],
			})

			// Day 0, hour 1, minute 2, second 3, tick 4 = 36000 + 1200 + 30 + 4 = 37234
			const result = parseTimestampMultiRoot({
				allUnits: [dayUnit, hourUnit, minuteUnit, secondUnit, tickUnit],
				timestamp: 37234,
			})

			expect(result.get('day')?.value).toBe(0)
			expect(result.get('hour')?.value).toBe(1)
			expect(result.get('minute')?.value).toBe(2)
			expect(result.get('second')?.value).toBe(3)
			expect(result.get('tick')?.value).toBe(4)
		})
	})

	describe('skipped child count accumulation', () => {
		it('continues counting when same displayName appears multiple times in children', () => {
			const franUnit = mockCalendarUnit({
				id: 'fran',
				name: 'Fran',
				displayName: 'Fran',
				duration: 1,
				formatShorthand: 'f',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [
					mockCalendarUnitParentRelation('year', 'fran', 5),
					mockCalendarUnitParentRelation('year', 'fran', 5),
				],
			})

			const frenaUnit = mockCalendarUnit({
				id: 'frena',
				name: 'Frena',
				displayName: 'Frena',
				duration: 1,
				formatShorthand: 'r',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [mockCalendarUnitParentRelation('year', 'frena', 10)],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 20,
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('year', 'fran', 5, { position: 0 }),
					mockCalendarUnitChildRelation('year', 'frena', 10, { position: 1 }),
					mockCalendarUnitChildRelation('year', 'fran', 5, { position: 2 }),
				],
				parents: [],
			})

			const units = [yearUnit, franUnit, frenaUnit]

			// Timestamp 0: First Fran (value 0, one-indexed → 1)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 0 }).get('fran')?.value).toBe(0)

			// Timestamp 4: Last of first Frans set (value 4, one-indexed → 5)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 4 }).get('fran')?.value).toBe(4)

			// Timestamp 15: First of second Frans set - should accumulate 5 from first set
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 15 }).get('fran')?.value).toBe(5)

			// Timestamp 19: Last Fran (value 9, one-indexed → 10)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 19 }).get('fran')?.value).toBe(9)
		})

		it('accumulates correctly with three occurrences of same displayName', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const nightUnit = mockCalendarUnit({
				id: 'night',
				name: 'Night',
				displayName: 'Night',
				duration: 1,
				formatShorthand: 'n',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 14,
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 0 }),
					mockCalendarUnitChildRelation('year', 'night', 2, { position: 1 }),
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 2 }),
					mockCalendarUnitChildRelation('year', 'night', 2, { position: 3 }),
					mockCalendarUnitChildRelation('year', 'day', 4, { position: 4 }),
				],
				parents: [],
			})

			const units = [yearUnit, dayUnit, nightUnit]

			// First batch (0-2): Days 0-2
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 0 }).get('day')?.value).toBe(0)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 2 }).get('day')?.value).toBe(2)

			// Second batch (5-7): Days 3-5 (accumulated from first 3)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 5 }).get('day')?.value).toBe(3)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 7 }).get('day')?.value).toBe(5)

			// Third batch (10-13): Days 6-9 (accumulated from first 6)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 10 }).get('day')?.value).toBe(6)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 13 }).get('day')?.value).toBe(9)
		})

		it('tracks different displayNames independently', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const nightUnit = mockCalendarUnit({
				id: 'night',
				name: 'Night',
				displayName: 'Night',
				duration: 1,
				formatShorthand: 'n',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 6,
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('year', 'day', 2, { position: 0 }),
					mockCalendarUnitChildRelation('year', 'night', 2, { position: 1 }),
					mockCalendarUnitChildRelation('year', 'day', 2, { position: 2 }),
				],
				parents: [],
			})

			const units = [yearUnit, dayUnit, nightUnit]

			// First days (0-1): Day 0, Day 1
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 0 }).get('day')?.value).toBe(0)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 1 }).get('day')?.value).toBe(1)

			// Second days (4-5): Day 2, Day 3 (accumulated from first 2)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 4 }).get('day')?.value).toBe(2)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 5 }).get('day')?.value).toBe(3)
		})
	})

	describe('child unit not found scenario', () => {
		it('handles missing child unit gracefully', () => {
			const parentUnit = mockCalendarUnit({
				id: 'parent',
				name: 'Parent',
				duration: 10,
				formatShorthand: 'p',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('parent', 'missing-child', 10)],
				parents: [],
			})

			const result = parseTimestampMultiRoot({ allUnits: [parentUnit], timestamp: 15 })

			// Should not crash
			expect(result.get('parent')?.value).toBe(1)
		})
	})

	describe('skipping hidden children accumulation', () => {
		it('skips past hidden children and accumulates their non-hidden descendants', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [
					mockCalendarUnitParentRelation('week', 'day', 7),
					mockCalendarUnitParentRelation('year', 'day', 3),
				],
			})

			const weekUnit = mockCalendarUnit({
				id: 'week',
				name: 'Week',
				displayName: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('week', 'day', 7)],
				parents: [mockCalendarUnitParentRelation('year', 'week', 1)],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 10,
				formatShorthand: 'y',
				formatMode: 'Numeric',
				children: [
					mockCalendarUnitChildRelation('year', 'week', 1, { position: 0 }),
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 1 }),
				],
				parents: [],
			})

			const units = [yearUnit, weekUnit, dayUnit]

			// Timestamps 0-6 are in the Hidden Week, which contains days
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 0 }).get('day')?.value).toBe(0)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 6 }).get('day')?.value).toBe(6)

			// Timestamps 7-9 are in the direct Days after the week
			// Hidden week's 7 days get accumulated
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 7 }).get('day')?.value).toBe(7)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 8 }).get('day')?.value).toBe(8)
			expect(parseTimestampMultiRoot({ allUnits: units, timestamp: 9 }).get('day')?.value).toBe(9)
		})
	})

	describe('mixed format modes in hierarchy', () => {
		it('parses hierarchy with Hidden intermediate and visible leaf', () => {
			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('shift', 'hour', 8)],
			})

			const shiftUnit = mockCalendarUnit({
				id: 'shift',
				name: 'Shift',
				duration: 8,
				formatShorthand: 's',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('shift', 'hour', 8)],
				parents: [mockCalendarUnitParentRelation('day', 'shift', 3)],
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('day', 'shift', 3)],
				parents: [],
			})

			// Hour 20 is day 0, hour 20 (because shift is hidden, hours accumulate)
			const result = parseTimestampMultiRoot({ allUnits: [dayUnit, shiftUnit, hourUnit], timestamp: 20 })

			expect(result.get('day')?.value).toBe(0)
			expect(result.get('hour')?.value).toBe(20)
		})
	})

	describe('boundary conditions', () => {
		it('handles exact unit boundary transitions', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
				parents: [],
			})

			// Last day of month 1
			const result29 = parseTimestampMultiRoot({ allUnits: [monthUnit, dayUnit], timestamp: 29 })
			expect(result29.get('month')?.value).toBe(0)
			expect(result29.get('day')?.value).toBe(29)

			// First day of month 2
			const result30 = parseTimestampMultiRoot({ allUnits: [monthUnit, dayUnit], timestamp: 30 })
			expect(result30.get('month')?.value).toBe(1)
			expect(result30.get('day')?.value).toBe(0)
		})
	})

	describe('negative timestamps', () => {
		describe('simple calendar (days in months in years)', () => {
			const createSimpleCalendar = () => {
				const dayUnit = mockCalendarUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					displayNameShort: 'D',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 2,
					children: [],
					parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
				})

				const monthUnit = mockCalendarUnit({
					id: 'month',
					name: 'Month',
					displayName: 'Month',
					displayNameShort: 'M',
					duration: 30,
					formatShorthand: 'm',
					formatMode: 'NumericOneIndexed',
					position: 1,
					children: [mockCalendarUnitChildRelation('month', 'day', 30)],
					parents: [mockCalendarUnitParentRelation('year', 'month', 12)],
				})

				const yearUnit = mockCalendarUnit({
					id: 'year',
					name: 'Year',
					displayName: 'Year',
					displayNameShort: 'Y',
					duration: 360,
					formatShorthand: 'y',
					formatMode: 'Numeric',
					position: 0,
					children: [mockCalendarUnitChildRelation('year', 'month', 12)],
					parents: [],
				})

				return [yearUnit, monthUnit, dayUnit]
			}

			it('timestamp -1 is year -1, month 11, day 29', () => {
				const units = createSimpleCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -1 })

				expect(result.get('year')?.value).toBe(-1)
				expect(result.get('month')?.value).toBe(11)
				expect(result.get('day')?.value).toBe(29)
			})

			it('timestamp -30 is year -1, month 11, day 0', () => {
				const units = createSimpleCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -30 })

				expect(result.get('year')?.value).toBe(-1)
				expect(result.get('month')?.value).toBe(11)
				expect(result.get('day')?.value).toBe(0)
			})

			it('timestamp -31 is year -1, month 10, day 29', () => {
				const units = createSimpleCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -31 })

				expect(result.get('year')?.value).toBe(-1)
				expect(result.get('month')?.value).toBe(10)
				expect(result.get('day')?.value).toBe(29)
			})

			it('timestamp -360 is year -1, month 0, day 0', () => {
				const units = createSimpleCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -360 })

				expect(result.get('year')?.value).toBe(-1)
				expect(result.get('month')?.value).toBe(0)
				expect(result.get('day')?.value).toBe(0)
			})

			it('timestamp -361 is year -2, month 11, day 29', () => {
				const units = createSimpleCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -361 })

				expect(result.get('year')?.value).toBe(-2)
				expect(result.get('month')?.value).toBe(11)
				expect(result.get('day')?.value).toBe(29)
			})
		})

		describe('basic negative timestamp', () => {
			it('parses negative timestamps for simple day unit', () => {
				const units: CalendarUnit[] = [
					mockCalendarUnit({
						id: 'day',
						name: 'Day',
						duration: 1,
						formatShorthand: 'd',
						formatMode: 'Numeric',
					}),
				]

				expect(parseTimestampMultiRoot({ allUnits: units, timestamp: -1 }).get('day')?.value).toBe(-1)
				expect(parseTimestampMultiRoot({ allUnits: units, timestamp: -5 }).get('day')?.value).toBe(-5)
				expect(parseTimestampMultiRoot({ allUnits: units, timestamp: -100 }).get('day')?.value).toBe(-100)
			})
		})

		describe('calendar with hidden cycles (like Gregorian)', () => {
			const createGregorianCalendar = () => {
				const MINUTE = 1
				const HOUR = 60 * MINUTE
				const DAY = 24 * HOUR
				const REGULAR_YEAR = 365 * DAY
				const LEAP_YEAR = 366 * DAY
				const FOUR_YEAR_CYCLE = 3 * REGULAR_YEAR + LEAP_YEAR
				const HUNDRED_YEAR_CYCLE = 24 * FOUR_YEAR_CYCLE + 4 * REGULAR_YEAR
				const FOUR_HUNDRED_YEAR_CYCLE = 3 * HUNDRED_YEAR_CYCLE + 25 * FOUR_YEAR_CYCLE

				const minuteUnit = mockCalendarUnit({
					id: 'minute',
					name: 'Minute',
					displayName: 'Minute',
					duration: MINUTE,
					formatShorthand: 'i',
					formatMode: 'Numeric',
					position: 5,
					children: [],
					parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
				})

				const hourUnit = mockCalendarUnit({
					id: 'hour',
					name: 'Hour',
					displayName: 'Hour',
					duration: HOUR,
					formatShorthand: 'h',
					formatMode: 'Numeric',
					position: 4,
					children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
					parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
				})

				const dayUnit = mockCalendarUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					duration: DAY,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 3,
					children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
					parents: [
						mockCalendarUnitParentRelation('regularYear', 'day', 365),
						mockCalendarUnitParentRelation('leapYear', 'day', 366),
					],
				})

				const regularYearUnit = mockCalendarUnit({
					id: 'regularYear',
					name: 'Regular year',
					displayName: 'Year',
					duration: REGULAR_YEAR,
					formatShorthand: 'y',
					formatMode: 'NumericOneIndexed',
					position: 2,
					children: [mockCalendarUnitChildRelation('regularYear', 'day', 365)],
					parents: [
						mockCalendarUnitParentRelation('fourYearCycle', 'regularYear', 3),
						mockCalendarUnitParentRelation('hundredYearCycle', 'regularYear', 4),
					],
				})

				const leapYearUnit = mockCalendarUnit({
					id: 'leapYear',
					name: 'Leap year',
					displayName: 'Year',
					duration: LEAP_YEAR,
					formatShorthand: 'y',
					formatMode: 'NumericOneIndexed',
					position: 2,
					children: [mockCalendarUnitChildRelation('leapYear', 'day', 366)],
					parents: [mockCalendarUnitParentRelation('fourYearCycle', 'leapYear', 1)],
				})

				const fourYearCycleUnit = mockCalendarUnit({
					id: 'fourYearCycle',
					name: '4-year cycle',
					displayName: '4-year cycle',
					duration: FOUR_YEAR_CYCLE,
					formatShorthand: null,
					formatMode: 'Hidden',
					position: 1,
					children: [
						mockCalendarUnitChildRelation('fourYearCycle', 'regularYear', 3, { position: 0 }),
						mockCalendarUnitChildRelation('fourYearCycle', 'leapYear', 1, { position: 1 }),
					],
					parents: [
						mockCalendarUnitParentRelation('hundredYearCycle', 'fourYearCycle', 24),
						mockCalendarUnitParentRelation('fourHundredYearCycle', 'fourYearCycle', 25),
					],
				})

				const hundredYearCycleUnit = mockCalendarUnit({
					id: 'hundredYearCycle',
					name: '100-year cycle',
					displayName: '100-year cycle',
					duration: HUNDRED_YEAR_CYCLE,
					formatShorthand: null,
					formatMode: 'Hidden',
					position: 1,
					children: [
						mockCalendarUnitChildRelation('hundredYearCycle', 'fourYearCycle', 24, { position: 0 }),
						mockCalendarUnitChildRelation('hundredYearCycle', 'regularYear', 4, { position: 1 }),
					],
					parents: [mockCalendarUnitParentRelation('fourHundredYearCycle', 'hundredYearCycle', 3)],
				})

				const fourHundredYearCycleUnit = mockCalendarUnit({
					id: 'fourHundredYearCycle',
					name: '400-year cycle',
					displayName: '400-year cycle',
					duration: FOUR_HUNDRED_YEAR_CYCLE,
					formatShorthand: null,
					formatMode: 'Hidden',
					position: 0,
					children: [
						mockCalendarUnitChildRelation('fourHundredYearCycle', 'hundredYearCycle', 3, { position: 0 }),
						mockCalendarUnitChildRelation('fourHundredYearCycle', 'fourYearCycle', 25, { position: 1 }),
					],
					parents: [],
				})

				return [
					fourHundredYearCycleUnit,
					hundredYearCycleUnit,
					fourYearCycleUnit,
					regularYearUnit,
					leapYearUnit,
					dayUnit,
					hourUnit,
					minuteUnit,
				]
			}

			const MINUTE = 1
			const HOUR = 60 * MINUTE
			const DAY = 24 * HOUR
			const REGULAR_YEAR = 365 * DAY
			const LEAP_YEAR = 366 * DAY

			it('timestamp 0 parses to year 0, day 0, hour 0, minute 0', () => {
				const units = createGregorianCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: 0 })

				// regularYear or leapYear — value 0 for year
				const yearEntry = result.get('regularYear') ?? result.get('leapYear')
				expect(yearEntry?.value).toBe(0)
				expect(result.get('day')?.value).toBe(0)
				expect(result.get('hour')?.value).toBe(0)
				expect(result.get('minute')?.value).toBe(0)
			})

			it('timestamp -1 parses to last minute of year 0 (leap year, day 365)', () => {
				const units = createGregorianCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -1 })

				const yearEntry = result.get('regularYear') ?? result.get('leapYear')
				expect(yearEntry?.value).toBe(-1)
				expect(result.get('day')?.value).toBe(365)
				expect(result.get('hour')?.value).toBe(23)
				expect(result.get('minute')?.value).toBe(59)
			})

			it('timestamp -LEAP_YEAR parses to year -1, day 0, 00:00', () => {
				const units = createGregorianCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -LEAP_YEAR })

				const yearEntry = result.get('regularYear') ?? result.get('leapYear')
				expect(yearEntry?.value).toBe(-1)
				expect(result.get('day')?.value).toBe(0)
				expect(result.get('hour')?.value).toBe(0)
				expect(result.get('minute')?.value).toBe(0)
			})

			it('timestamp -(LEAP_YEAR + 1) parses to year -2, day 364, 23:59', () => {
				const units = createGregorianCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -(LEAP_YEAR + 1) })

				const yearEntry = result.get('regularYear') ?? result.get('leapYear')
				expect(yearEntry?.value).toBe(-2)
				expect(result.get('day')?.value).toBe(364)
				expect(result.get('hour')?.value).toBe(23)
				expect(result.get('minute')?.value).toBe(59)
			})

			it('timestamp -(LEAP_YEAR + REGULAR_YEAR) parses to year -2, day 0, 00:00', () => {
				const units = createGregorianCalendar()
				const result = parseTimestampMultiRoot({ allUnits: units, timestamp: -(LEAP_YEAR + REGULAR_YEAR) })

				const yearEntry = result.get('regularYear') ?? result.get('leapYear')
				expect(yearEntry?.value).toBe(-2)
				expect(result.get('day')?.value).toBe(0)
				expect(result.get('hour')?.value).toBe(0)
				expect(result.get('minute')?.value).toBe(0)
			})
		})
	})
})
