import { CalendarUnit } from '@api/types/calendarTypes'

import {
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { parseTimestampMultiRoot } from './parseTimestampMultiRoot'
import { resolveParsedTimestamp } from './resolveParsedTimestamp'

describe('resolveParsedTimestamp', () => {
	describe('basic functionality', () => {
		it('converts simple single unit back to timestamp', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const parsed = new Map([['day', { value: 5, formatShorthand: 'd' }]])
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(5)
		})

		it('returns 0 for zero value', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const parsed = new Map([['day', { value: 0, formatShorthand: 'd' }]])
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(0)
		})

		it('handles empty parsed map', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const parsed = new Map()
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(0)
		})
	})

	describe('hierarchical units', () => {
		it('converts day and hour back to timestamp', () => {
			const hour = mockCalendarUnit({ id: 'hour', name: 'Hour', duration: 1, formatShorthand: 'h' })
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})

			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			const units: CalendarUnit[] = [day, hour]

			// 2 days and 5 hours = 2*24 + 5 = 53
			const parsed = new Map([
				['day', { value: 2, formatShorthand: 'd' }],
				['hour', { value: 5, formatShorthand: 'h' }],
			])
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(53)
		})

		it('converts year, month, day hierarchy back to timestamp', () => {
			const day = mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' })
			const month = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'M',
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
			})
			const year = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				duration: 365,
				formatShorthand: 'y',
				children: [mockCalendarUnitChildRelation('year', 'month', 12)],
			})

			day.parents = [mockCalendarUnitParentRelation('month', 'day', 30)]
			month.parents = [mockCalendarUnitParentRelation('year', 'month', 12)]
			const units: CalendarUnit[] = [year, month, day]

			// 1 year, 2 months, 15 days = 1*365 + 2*30 + 15 = 440
			const parsed = new Map([
				['year', { value: 1, formatShorthand: 'y' }],
				['month', { value: 2, formatShorthand: 'M' }],
				['day', { value: 15, formatShorthand: 'd' }],
			])
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(440)
		})
	})

	describe('edge cases', () => {
		it('handles unit not found in units array gracefully', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			// Include a unit that doesn't exist in the units array
			const parsed = new Map([
				['day', { value: 5, formatShorthand: 'd' }],
				['unknown', { value: 10, formatShorthand: 'u' }],
			])
			// Should only count the known unit
			expect(resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })).toBe(5)
		})
	})

	describe('round-trip conversions (parseTimestampMultiRoot → resolveParsedTimestamp)', () => {
		it('round-trips with single unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const testValues = [0, 1, 5, 42, 100, 999, 10000]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips with day-hour hierarchy', () => {
			const hour = mockCalendarUnit({ id: 'hour', name: 'Hour', duration: 1, formatShorthand: 'h' })
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})

			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			const units: CalendarUnit[] = [day, hour]

			const testValues = [0, 1, 23, 24, 25, 47, 48, 100, 1000]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips with complex three-level hierarchy', () => {
			const second = mockCalendarUnit({ id: 'second', name: 'Second', duration: 1, formatShorthand: 's' })
			const minute = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 60,
				formatShorthand: 'm',
				children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
			})
			const hour = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 3600,
				formatShorthand: 'h',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			})

			second.parents = [mockCalendarUnitParentRelation('minute', 'second', 60)]
			minute.parents = [mockCalendarUnitParentRelation('hour', 'minute', 60)]
			const units: CalendarUnit[] = [hour, minute, second]

			const testValues = [0, 1, 59, 60, 61, 3599, 3600, 3661, 7200, 10000]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips with negative timestamps', () => {
			const hour = mockCalendarUnit({ id: 'hour', name: 'Hour', duration: 1, formatShorthand: 'h' })
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})

			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			const units: CalendarUnit[] = [day, hour]

			const testValues = [-1, -23, -24, -25, -100, -1000]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips with large timestamps', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const testValues = [1000000, 999999999]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('hidden units', () => {
		it('round-trips with hidden parent unit', () => {
			const hour = mockCalendarUnit({ id: 'hour', name: 'Hour', duration: 1, formatShorthand: 'h' })
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				formatMode: 'Hidden',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})

			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			const units: CalendarUnit[] = [day, hour]

			const testValues = [0, 1, 23, 24, 25, 100]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips with hidden child unit', () => {
			const minute = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 1,
				formatShorthand: 'm',
				formatMode: 'Hidden',
			})
			const hour = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 60,
				formatShorthand: 'h',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			})

			minute.parents = [mockCalendarUnitParentRelation('hour', 'minute', 60)]
			const units: CalendarUnit[] = [hour, minute]

			const testValues = [0, 1, 59, 60, 61, 120]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('multiple root units', () => {
		it('round-trips with multiple parallel root units', () => {
			const hour = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				position: 0,
			})
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 10,
				formatShorthand: 'd',
				position: 1,
			})

			const units: CalendarUnit[] = [hour, day]

			const testValues = [0, 1, 5, 9, 10, 15, 50, 100]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('custom labels', () => {
		it('round-trips with custom labels on child relations', () => {
			const hour = mockCalendarUnit({ id: 'hour', name: 'Hour', duration: 1, formatShorthand: 'h' })
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24, { label: 'Hours in a day' })],
			})

			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24, { label: 'Hours in a day' })]
			const units: CalendarUnit[] = [day, hour]

			const testValues = [0, 1, 24, 48, 100]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('gregorian calendar', () => {
		it('round-trips with realistic gregorian calendar for various timestamps', () => {
			const second = mockCalendarUnit({ id: 'second', name: 'Second', duration: 1, formatShorthand: 's' })
			const minute = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 60,
				formatShorthand: 'm',
				children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
			})
			const hour = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 3600,
				formatShorthand: 'h',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			})
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 86400,
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})
			const month = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 2592000,
				formatShorthand: 'M',
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
			})
			const year = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				duration: 31104000,
				formatShorthand: 'y',
				children: [mockCalendarUnitChildRelation('year', 'month', 12)],
			})

			second.parents = [mockCalendarUnitParentRelation('minute', 'second', 60)]
			minute.parents = [mockCalendarUnitParentRelation('hour', 'minute', 60)]
			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			day.parents = [mockCalendarUnitParentRelation('month', 'day', 30)]
			month.parents = [mockCalendarUnitParentRelation('year', 'month', 12)]

			const units: CalendarUnit[] = [year, month, day, hour, minute, second]

			const testValues = [-1, 0, 1, 100000, -100000, 5000000]
			for (const timestamp of testValues) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('esoteric calendar with 2-2-1-1-1 year pattern', () => {
		const createEsotericCalendar = () => {
			const DAY = 1
			const REGULAR_YEAR = 365 * DAY
			const LEAP_YEAR = 366 * DAY
			const FIVE_YEAR_CYCLE = 2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR + LEAP_YEAR

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: DAY,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 1,
				children: [],
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
				position: 0,
				children: [mockCalendarUnitChildRelation('regularYear', 'day', 365)],
				parents: [mockCalendarUnitParentRelation('fiveYearCycle', 'regularYear', 3)],
			})

			const leapYearUnit = mockCalendarUnit({
				id: 'leapYear',
				name: 'Leap year',
				displayName: 'Year',
				duration: LEAP_YEAR,
				formatShorthand: 'y',
				formatMode: 'NumericOneIndexed',
				position: 0,
				children: [mockCalendarUnitChildRelation('leapYear', 'day', 366)],
				parents: [mockCalendarUnitParentRelation('fiveYearCycle', 'leapYear', 2)],
			})

			const fiveYearCycleUnit = mockCalendarUnit({
				id: 'fiveYearCycle',
				name: '5-year cycle',
				displayName: '5-year cycle',
				duration: FIVE_YEAR_CYCLE,
				formatShorthand: null,
				formatMode: 'Hidden',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('fiveYearCycle', 'regularYear', 2, { position: 0 }),
					mockCalendarUnitChildRelation('fiveYearCycle', 'leapYear', 1, { position: 1 }),
					mockCalendarUnitChildRelation('fiveYearCycle', 'regularYear', 1, { position: 2 }),
					mockCalendarUnitChildRelation('fiveYearCycle', 'leapYear', 1, { position: 3 }),
				],
				parents: [],
			})

			return {
				units: [fiveYearCycleUnit, regularYearUnit, leapYearUnit, dayUnit] as CalendarUnit[],
				DAY,
				REGULAR_YEAR,
				LEAP_YEAR,
				FIVE_YEAR_CYCLE,
			}
		}

		it('round-trips timestamps across all year types in the pattern', () => {
			const { units } = createEsotericCalendar()

			const testTimestamps = [
				0, 100, 364, 365, 500, 729, 730, 900, 1095, 1096, 1200, 1460, 1461, 1600, 1826, 1827, 2000, 3654,
				5481,
			]

			for (const timestamp of testTimestamps) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips negative timestamps in the esoteric calendar', () => {
			const { units } = createEsotericCalendar()

			const testTimestamps = [-1, -365, -730, -1096, -1827, -3654]

			for (const timestamp of testTimestamps) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('stress test: handles complex boundaries and large values', () => {
			const { units, REGULAR_YEAR, LEAP_YEAR, FIVE_YEAR_CYCLE } = createEsotericCalendar()

			const stressTestTimestamps = [
				// Exact cycle boundaries
				0,
				FIVE_YEAR_CYCLE,
				2 * FIVE_YEAR_CYCLE,
				10 * FIVE_YEAR_CYCLE,
				100 * FIVE_YEAR_CYCLE,

				// Individual year boundaries within first cycle
				REGULAR_YEAR,
				2 * REGULAR_YEAR,
				2 * REGULAR_YEAR + LEAP_YEAR,
				2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR,

				// Mid-year values in each year type
				Math.floor(REGULAR_YEAR / 2),
				REGULAR_YEAR + Math.floor(REGULAR_YEAR / 2),
				2 * REGULAR_YEAR + Math.floor(LEAP_YEAR / 2),
				2 * REGULAR_YEAR + LEAP_YEAR + Math.floor(REGULAR_YEAR / 2),
				2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR + Math.floor(LEAP_YEAR / 2),

				// Boundaries across multiple cycles
				FIVE_YEAR_CYCLE + REGULAR_YEAR,
				3 * FIVE_YEAR_CYCLE + 2 * REGULAR_YEAR,
				7 * FIVE_YEAR_CYCLE + 2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR,

				// Large values
				365000,
				1000000,
				10000000,

				// Negative values - exact boundaries
				-1,
				-FIVE_YEAR_CYCLE,
				-10 * FIVE_YEAR_CYCLE,

				// Negative values - year boundaries
				-REGULAR_YEAR,
				-2 * REGULAR_YEAR,
				-FIVE_YEAR_CYCLE + REGULAR_YEAR,

				// Large negative values
				-365000,
				-1000000,
				-10000000,

				// Off-by-one tests around boundaries
				FIVE_YEAR_CYCLE - 1,
				FIVE_YEAR_CYCLE + 1,
				2 * REGULAR_YEAR - 1,
				2 * REGULAR_YEAR + 1,
				2 * REGULAR_YEAR + LEAP_YEAR - 1,
				2 * REGULAR_YEAR + LEAP_YEAR + 1,

				// Prime-like offsets to catch calculation errors
				17,
				97,
				541,
				1999,
				FIVE_YEAR_CYCLE + 37,
				3 * FIVE_YEAR_CYCLE + 127,
			]

			for (const timestamp of stressTestTimestamps) {
				const parsed = parseTimestampMultiRoot({ allUnits: units, timestamp })
				const reconstructed = resolveParsedTimestamp({ allUnits: units, parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})
})
