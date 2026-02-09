import { CalendarUnit } from '@api/types/calendarTypes'
import { renderHook } from '@testing-library/react'

import {
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { useParseTimestampToUnits } from './useParseTimestampToUnits'
import { useParseUnitsToTimestamp } from './useParseUnitsToTimestamp'

describe('useParseUnitsToTimestamp', () => {
	describe('basic functionality', () => {
		it('converts simple single unit back to timestamp', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const parsed = new Map([['day', { value: 5, formatShorthand: 'd' }]])
			expect(result.current({ parsedTimestamp: parsed })).toBe(5)
		})

		it('returns 0 for zero value', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const parsed = new Map([['day', { value: 0, formatShorthand: 'd' }]])
			expect(result.current({ parsedTimestamp: parsed })).toBe(0)
		})

		it('handles empty parsed map', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const parsed = new Map()
			expect(result.current({ parsedTimestamp: parsed })).toBe(0)
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

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// 2 days and 5 hours = 2*24 + 5 = 53
			const parsed = new Map([
				['day', { value: 2, formatShorthand: 'd' }],
				['hour', { value: 5, formatShorthand: 'h' }],
			])
			expect(result.current({ parsedTimestamp: parsed })).toBe(53)
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

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// 1 year, 2 months, 15 days = 1*365 + 2*30 + 15 = 440
			const parsed = new Map([
				['year', { value: 1, formatShorthand: 'y' }],
				['month', { value: 2, formatShorthand: 'M' }],
				['day', { value: 15, formatShorthand: 'd' }],
			])
			expect(result.current({ parsedTimestamp: parsed })).toBe(440)
		})
	})

	describe('round-trip conversions', () => {
		it('round-trips with single unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 5, 42, 100, 999, 10000]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 23, 24, 25, 47, 48, 100, 1000]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 59, 60, 61, 3599, 3600, 3661, 7200, 10000]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [-1, -23, -24, -25, -100, -1000]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 23, 24, 25, 100]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 59, 60, 61, 120]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 5, 9, 10, 15, 50, 100]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('edge cases', () => {
		it('handles unit not found in units array gracefully', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// Include a unit that doesn't exist in the units array
			const parsed = new Map([
				['day', { value: 5, formatShorthand: 'd' }],
				['unknown', { value: 10, formatShorthand: 'u' }],
			])
			// Should only count the known unit
			expect(result.current({ parsedTimestamp: parsed })).toBe(5)
		})

		it('handles large timestamps', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [1000000, 999999999]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
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

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testValues = [0, 1, 24, 48, 100]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('gregorian calendar', () => {
		it('round-trips with realistic gregorian calendar for various timestamps', () => {
			// Build a simplified gregorian calendar: year > month > day > hour > minute > second
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
				duration: 3600, // 60 * 60
				formatShorthand: 'h',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			})
			const day = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 86400, // 24 * 60 * 60
				formatShorthand: 'd',
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
			})
			const month = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 2592000, // 30 * 24 * 60 * 60 (simplified: all months have 30 days)
				formatShorthand: 'M',
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
			})
			const year = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				duration: 31104000, // 12 * 30 * 24 * 60 * 60 (360 days for consistency)
				formatShorthand: 'y',
				children: [mockCalendarUnitChildRelation('year', 'month', 12)],
			})

			second.parents = [mockCalendarUnitParentRelation('minute', 'second', 60)]
			minute.parents = [mockCalendarUnitParentRelation('hour', 'minute', 60)]
			hour.parents = [mockCalendarUnitParentRelation('day', 'hour', 24)]
			day.parents = [mockCalendarUnitParentRelation('month', 'day', 30)]
			month.parents = [mockCalendarUnitParentRelation('year', 'month', 12)]

			const units: CalendarUnit[] = [year, month, day, hour, minute, second]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// Test various timestamps including edge cases
			const testValues = [-1, 0, 1, 100000, -100000, 5000000]
			for (const timestamp of testValues) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})

	describe('esoteric calendar with 2-2-1-1-1 year pattern', () => {
		it('round-trips timestamps across all year types in the pattern', () => {
			// Pattern: 2 normal years (365 days), 1 leap year (366 days), 1 normal year (365 days), 1 leap year (366 days)
			// 5-year cycle = 365 + 365 + 366 + 365 + 366 = 1827 days
			const DAY = 1
			const REGULAR_YEAR = 365 * DAY
			const LEAP_YEAR = 366 * DAY
			const FIVE_YEAR_CYCLE = 2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR + LEAP_YEAR // 1827 days

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
				parents: [
					mockCalendarUnitParentRelation('fiveYearCycle', 'regularYear', 3), // 3 regular years per cycle
				],
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
				parents: [
					mockCalendarUnitParentRelation('fiveYearCycle', 'leapYear', 2), // 2 leap years per cycle
				],
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
					mockCalendarUnitChildRelation('fiveYearCycle', 'regularYear', 2, { position: 0 }), // Years 1-2
					mockCalendarUnitChildRelation('fiveYearCycle', 'leapYear', 1, { position: 1 }), // Year 3
					mockCalendarUnitChildRelation('fiveYearCycle', 'regularYear', 1, { position: 2 }), // Year 4
					mockCalendarUnitChildRelation('fiveYearCycle', 'leapYear', 1, { position: 3 }), // Year 5
				],
				parents: [],
			})

			const units: CalendarUnit[] = [fiveYearCycleUnit, regularYearUnit, leapYearUnit, dayUnit]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// Test timestamps at key boundaries in the 5-year cycle:
			// Day 0 = Start of Year 1 (regular)
			// Day 365 = Start of Year 2 (regular)
			// Day 730 = Start of Year 3 (leap)
			// Day 1096 = Start of Year 4 (regular)
			// Day 1461 = Start of Year 5 (leap)
			// Day 1827 = Start of next cycle (Year 1 again)

			const testTimestamps = [
				0, // Start of Year 1 (regular)
				100, // Mid Year 1 (regular)
				364, // Last day of Year 1 (regular)
				365, // Start of Year 2 (regular)
				500, // Mid Year 2 (regular)
				729, // Last day of Year 2 (regular)
				730, // Start of Year 3 (leap)
				900, // Mid Year 3 (leap)
				1095, // Last day of Year 3 (leap)
				1096, // Start of Year 4 (regular)
				1200, // Mid Year 4 (regular)
				1460, // Last day of Year 4 (regular)
				1461, // Start of Year 5 (leap)
				1600, // Mid Year 5 (leap)
				1826, // Last day of Year 5 (leap)
				1827, // Start of next cycle
				2000, // Mid next cycle
				3654, // Two complete cycles
				5481, // Three complete cycles
			]

			for (const timestamp of testTimestamps) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('round-trips negative timestamps in the esoteric calendar', () => {
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

			const units: CalendarUnit[] = [fiveYearCycleUnit, regularYearUnit, leapYearUnit, dayUnit]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			const testTimestamps = [
				-1, // One day before epoch
				-365, // One year before epoch
				-730, // Two years before epoch
				-1096, // Three years before epoch
				-1827, // One complete cycle before epoch
				-3654, // Two complete cycles before epoch
			]

			for (const timestamp of testTimestamps) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})

		it('stress test: handles complex boundaries and large values', () => {
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

			const units: CalendarUnit[] = [fiveYearCycleUnit, regularYearUnit, leapYearUnit, dayUnit]

			const { result: parseToUnits } = renderHook(() => useParseTimestampToUnits({ units }))
			const { result: parseToTimestamp } = renderHook(() => useParseUnitsToTimestamp({ units }))

			// Comprehensive stress test values
			const stressTestTimestamps = [
				// Exact cycle boundaries
				0, // Start of cycle 1
				FIVE_YEAR_CYCLE, // Start of cycle 2
				2 * FIVE_YEAR_CYCLE, // Start of cycle 3
				10 * FIVE_YEAR_CYCLE, // Start of cycle 11
				100 * FIVE_YEAR_CYCLE, // Start of cycle 101

				// Individual year boundaries within first cycle
				REGULAR_YEAR, // End of year 1, start of year 2
				2 * REGULAR_YEAR, // End of year 2, start of year 3 (leap)
				2 * REGULAR_YEAR + LEAP_YEAR, // End of year 3, start of year 4 (regular)
				2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR, // End of year 4, start of year 5 (leap)

				// Mid-year values in each year type
				Math.floor(REGULAR_YEAR / 2), // Mid year 1
				REGULAR_YEAR + Math.floor(REGULAR_YEAR / 2), // Mid year 2
				2 * REGULAR_YEAR + Math.floor(LEAP_YEAR / 2), // Mid year 3
				2 * REGULAR_YEAR + LEAP_YEAR + Math.floor(REGULAR_YEAR / 2), // Mid year 4
				2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR + Math.floor(LEAP_YEAR / 2), // Mid year 5

				// Boundaries across multiple cycles
				FIVE_YEAR_CYCLE + REGULAR_YEAR, // Year 2 of cycle 2
				3 * FIVE_YEAR_CYCLE + 2 * REGULAR_YEAR, // Year 3 of cycle 4
				7 * FIVE_YEAR_CYCLE + 2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR, // Year 5 of cycle 8

				// Large values
				365000, // ~200 cycles
				1000000, // ~547 cycles
				10000000, // ~5474 cycles

				// Negative values - exact boundaries
				-1, // Last day of previous cycle
				-FIVE_YEAR_CYCLE, // Start of cycle -1
				-10 * FIVE_YEAR_CYCLE, // Start of cycle -10

				// Negative values - year boundaries
				-REGULAR_YEAR,
				-2 * REGULAR_YEAR,
				-FIVE_YEAR_CYCLE + REGULAR_YEAR, // Year 2 of cycle -1

				// Large negative values
				-365000,
				-1000000,
				-10000000,

				// Off-by-one tests around boundaries
				FIVE_YEAR_CYCLE - 1, // Last day of first cycle
				FIVE_YEAR_CYCLE + 1, // Second day of second cycle
				2 * REGULAR_YEAR - 1, // Last day of year 2
				2 * REGULAR_YEAR + 1, // Second day of year 3
				2 * REGULAR_YEAR + LEAP_YEAR - 1, // Last day of year 3
				2 * REGULAR_YEAR + LEAP_YEAR + 1, // Second day of year 4

				// Prime-like offsets to catch calculation errors
				17,
				97,
				541,
				1999,
				FIVE_YEAR_CYCLE + 37,
				3 * FIVE_YEAR_CYCLE + 127,
			]

			for (const timestamp of stressTestTimestamps) {
				const parsed = parseToUnits.current({ timestamp })
				const reconstructed = parseToTimestamp.current({ parsedTimestamp: parsed })
				expect(reconstructed).toBe(timestamp)
			}
		})
	})
})
