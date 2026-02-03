import { CalendarUnit } from '@api/types/calendarTypes'
import { renderHook } from '@testing-library/react'

import { useFormatTimestampUnits } from './useFormatTimestampUnits'

type TestCalendarUnit = Omit<CalendarUnit, 'createdAt' | 'updatedAt' | 'calendarId' | 'treeDepth'> & {
	createdAt?: string
	updatedAt?: string
	calendarId?: string
	treeDepth?: number
}

const createUnit = (overrides: Partial<TestCalendarUnit> & { id: string; name: string }): CalendarUnit => ({
	id: overrides.id,
	name: overrides.name,
	displayName: overrides.displayName ?? overrides.name,
	displayNameShort: overrides.displayNameShort ?? overrides.name.substring(0, 1).toUpperCase(),
	displayNamePlural: overrides.displayNamePlural ?? overrides.name + 's',
	formatMode: overrides.formatMode ?? 'Numeric',
	formatShorthand: overrides.formatShorthand ?? null,
	duration: overrides.duration ?? 1,
	position: overrides.position ?? 0,
	children: overrides.children ?? [],
	parents: overrides.parents ?? [],
	createdAt: overrides.createdAt ?? '2024-01-01T00:00:00.000Z',
	updatedAt: overrides.updatedAt ?? '2024-01-01T00:00:00.000Z',
	calendarId: overrides.calendarId ?? 'calendar-1',
	treeDepth: overrides.treeDepth ?? 0,
})

const createChildRelation = (
	parentUnitId: string,
	childUnitId: string,
	repeats: number,
	overrides: { label?: string; position?: number } = {},
) => ({
	id: `${parentUnitId}-${childUnitId}`,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
	position: overrides.position ?? 0,
	label: overrides.label ?? null,
	repeats,
	parentUnitId,
	childUnitId,
})

const createParentRelation = (
	parentUnitId: string,
	childUnitId: string,
	repeats: number,
	overrides: { label?: string; position?: number } = {},
) => ({
	id: `${parentUnitId}-${childUnitId}`,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
	position: overrides.position ?? 0,
	label: overrides.label ?? null,
	repeats,
	parentUnitId,
	childUnitId,
})

describe('useFormatTimestampUnits', () => {
	describe('empty and invalid date format strings', () => {
		it('returns "No date format specified" for empty or whitespace-only format strings', () => {
			const units: CalendarUnit[] = [
				createUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]

			const testCases = ['', '   ', '\t\t', '\n']
			for (const dateFormatString of testCases) {
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString }))
				expect(result.current({ timestamp: 0 })).toBe('No date format specified')
			}
		})
	})

	describe('basic numeric formatting', () => {
		it('formats timestamp 0 as 0 for a simple day unit', () => {
			const units: CalendarUnit[] = [
				createUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd', formatMode: 'Numeric' }),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 0 })).toBe('0')
		})

		it('formats timestamp 5 as 5 for a simple day unit', () => {
			const units: CalendarUnit[] = [
				createUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd', formatMode: 'Numeric' }),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('5')
		})

		it('pads numbers when multiple format characters are used', () => {
			const units: CalendarUnit[] = [
				createUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd', formatMode: 'Numeric' }),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'ddd' }))

			expect(result.current({ timestamp: 5 })).toBe('005')
		})

		it('does not truncate numbers larger than padding', () => {
			const units: CalendarUnit[] = [
				createUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd', formatMode: 'Numeric' }),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'dd' }))

			expect(result.current({ timestamp: 1234 })).toBe('1234')
		})
	})

	describe('NumericOneIndexed format mode', () => {
		it('formats timestamp 0 as 1 for one-indexed unit', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 0 })).toBe('1')
		})

		it('formats timestamp 9 as 10 for one-indexed unit', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 9 })).toBe('10')
		})

		it('pads one-indexed numbers correctly', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'ddd' }))

			expect(result.current({ timestamp: 0 })).toBe('001')
		})
	})

	describe('Name format mode', () => {
		it('shows short display name with single format character', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					displayNameShort: 'D',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Name',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('D 5')
		})

		it('shows full display name with multiple format characters', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					displayNameShort: 'D',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Name',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'dd' }))

			expect(result.current({ timestamp: 5 })).toBe('Day 05')
		})
	})

	describe('NameOneIndexed format mode', () => {
		it('shows short display name with 1-indexed value', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					displayNameShort: 'D',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NameOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 0 })).toBe('D 1')
		})

		it('shows full display name with multiple format characters and 1-indexed value', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					displayNameShort: 'D',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NameOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'dd' }))

			expect(result.current({ timestamp: 4 })).toBe('Day 05')
		})
	})

	describe('hierarchical calendar (days in months in years)', () => {
		const createSimpleCalendar = () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 2,
				children: [],
				parents: [createParentRelation('month', 'day', 30)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				displayName: 'Month',
				displayNameShort: 'M',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
				position: 1,
				children: [createChildRelation('month', 'day', 30)],
				parents: [createParentRelation('year', 'month', 12)],
			})

			const yearUnit = createUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				displayNameShort: 'Y',
				duration: 360, // 12 months * 30 days
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [createChildRelation('year', 'month', 12)],
				parents: [],
			})

			return [yearUnit, monthUnit, dayUnit]
		}

		it('formats timestamp 0 as year 0, month 1, day 1', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

			expect(result.current({ timestamp: 0 })).toBe('0-01-01')
		})

		it('formats day 15 of month 1 year 0', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

			expect(result.current({ timestamp: 14 })).toBe('0-01-15')
		})

		it('formats first day of second month', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

			// Day 30 is first day of month 2 (0-indexed: day 30, month 1)
			expect(result.current({ timestamp: 30 })).toBe('0-02-01')
		})

		it('formats last day of first year', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

			// Day 359 is last day of year 0 (month 12, day 30)
			expect(result.current({ timestamp: 359 })).toBe('0-12-30')
		})

		it('formats first day of second year', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

			// Day 360 is first day of year 1
			expect(result.current({ timestamp: 360 })).toBe('1-01-01')
		})

		it('formats large timestamp correctly', () => {
			const units = createSimpleCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'yyyy-mm-dd' }))

			// Year 100, month 6, day 15 = 100*360 + 5*30 + 14 = 36000 + 150 + 14 = 36164
			expect(result.current({ timestamp: 36164 })).toBe('0100-06-15')
		})
	})

	describe('format string with literal characters', () => {
		it('preserves unrecognized characters in format string', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'Day: d' }))

			expect(result.current({ timestamp: 5 })).toBe('Day: 5')
		})

		it('handles format string with separators', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('month', 'day', 30)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [createChildRelation('month', 'day', 30)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, dayUnit], dateFormatString: 'm/dd' }),
			)

			expect(result.current({ timestamp: 35 })).toBe('1/05')
		})
	})

	describe('case sensitivity', () => {
		it('matches case-insensitively when format has only one case', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'D',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('5')
		})

		it('matches case-sensitively when both cases are present in format', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [],
			})

			const decadeUnit = createUnit({
				id: 'decade',
				name: 'Decade',
				duration: 10,
				formatShorthand: 'D',
				formatMode: 'Numeric',
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, decadeUnit], dateFormatString: 'D-d' }),
			)

			// Both units are roots, so they get formatted independently
			// D matches decade (timestamp 15 / 10 = 1), d matches day (timestamp 15 / 1 = 15)
			expect(result.current({ timestamp: 15 })).toBe('1-15')
		})
	})

	describe('Hidden format mode', () => {
		it('hidden units pass their count to children', () => {
			// Week is hidden, days show count within visible scope
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('week', 'day', 7)],
			})

			const weekUnit = createUnit({
				id: 'week',
				name: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden',
				children: [createChildRelation('week', 'day', 7)],
				parents: [createParentRelation('month', 'week', 4)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 28,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [createChildRelation('month', 'week', 4)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, weekUnit, dayUnit], dateFormatString: 'm-dd' }),
			)

			// Day 10 is in week 2 (hidden), should show as day 10 of month
			expect(result.current({ timestamp: 10 })).toBe('0-10')
		})

		it('multiple hidden levels accumulate correctly', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('week', 'day', 7)],
			})

			const weekUnit = createUnit({
				id: 'week',
				name: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden',
				children: [createChildRelation('week', 'day', 7)],
				parents: [createParentRelation('fortnight', 'week', 2)],
			})

			const fortnightUnit = createUnit({
				id: 'fortnight',
				name: 'Fortnight',
				duration: 14,
				formatShorthand: 'f',
				formatMode: 'Hidden',
				children: [createChildRelation('fortnight', 'week', 2)],
				parents: [createParentRelation('month', 'fortnight', 2)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 28,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [createChildRelation('month', 'fortnight', 2)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [monthUnit, fortnightUnit, weekUnit, dayUnit],
					dateFormatString: 'm-dd',
				}),
			)

			// Day 20 should show as day 20 of month 0
			expect(result.current({ timestamp: 20 })).toBe('0-20')
		})
	})

	describe('custom labels on child relations', () => {
		it('uses custom label regardless of symbol count', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
				displayName: 'Day',
				displayNameShort: 'D',
				children: [],
				parents: [createParentRelation('month', 'day', 30, { label: 'Festival Day' })],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [createChildRelation('month', 'day', 30, { label: 'Festival Day' })],
				parents: [],
			})

			// Single symbol
			const { result: result1 } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, dayUnit], dateFormatString: 'm d' }),
			)
			expect(result1.current({ timestamp: 5 })).toBe('0 Festival Day')

			// Multiple symbols - still uses label, not display name
			const { result: result2 } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, dayUnit], dateFormatString: 'm ddd' }),
			)
			expect(result2.current({ timestamp: 5 })).toBe('0 Festival Day')
		})
	})

	describe('multiple root units', () => {
		it('combines formatting from multiple independent roots', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [hourUnit, dayUnit], dateFormatString: 'h:d' }),
			)

			// Both are roots with duration 1, so both show timestamp value
			expect(result.current({ timestamp: 10 })).toBe('10:10')
		})

		it('respects position ordering of root units', () => {
			const alphaUnit = createUnit({
				id: 'alpha',
				name: 'Alpha',
				duration: 1,
				formatShorthand: 'a',
				formatMode: 'Numeric',
				position: 2,
				children: [],
				parents: [],
			})

			const betaUnit = createUnit({
				id: 'beta',
				name: 'Beta',
				duration: 1,
				formatShorthand: 'b',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const gammaUnit = createUnit({
				id: 'gamma',
				name: 'Gamma',
				duration: 1,
				formatShorthand: 'g',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [alphaUnit, betaUnit, gammaUnit], dateFormatString: 'a-b-g' }),
			)

			expect(result.current({ timestamp: 5 })).toBe('5-5-5')
		})
	})

	describe('result capitalization', () => {
		it('capitalizes first character of result', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'day',
					displayName: 'day',
					displayNameShort: 'd',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Name',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'dd' }))

			// "day 05" -> "Day 05"
			expect(result.current({ timestamp: 5 })).toBe('Day 05')
		})

		it('handles empty result after formatting', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'x' }))

			// 'x' doesn't match any unit, so it's treated as literal
			expect(result.current({ timestamp: 5 })).toBe('X')
		})
	})

	describe('units with no matching format shorthand', () => {
		it('preserves format characters that do not match any unit', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'xxx d' }))

			expect(result.current({ timestamp: 5 })).toBe('Xxx 5')
		})
	})

	describe('units with null formatShorthand', () => {
		it('skips units with null formatShorthand', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: null,
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			// 'd' doesn't match (unit has null shorthand), so treated as literal
			expect(result.current({ timestamp: 5 })).toBe('D')
		})
	})

	describe('complex calendar with multiple unit types', () => {
		const createComplexCalendar = () => {
			const secondUnit = createUnit({
				id: 'second',
				name: 'Second',
				displayName: 'Second',
				displayNameShort: 'S',
				duration: 1,
				formatShorthand: 's',
				formatMode: 'Numeric',
				position: 3,
				children: [],
				parents: [createParentRelation('minute', 'second', 60)],
			})

			const minuteUnit = createUnit({
				id: 'minute',
				name: 'Minute',
				displayName: 'Minute',
				displayNameShort: 'M',
				duration: 60,
				formatShorthand: 'i',
				formatMode: 'Numeric',
				position: 2,
				children: [createChildRelation('minute', 'second', 60)],
				parents: [createParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				displayName: 'Hour',
				displayNameShort: 'H',
				duration: 3600,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 1,
				children: [createChildRelation('hour', 'minute', 60)],
				parents: [createParentRelation('day', 'hour', 24)],
			})

			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 86400,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 0,
				children: [createChildRelation('day', 'hour', 24)],
				parents: [],
			})

			return [dayUnit, hourUnit, minuteUnit, secondUnit]
		}

		it('formats midnight of day 1', () => {
			const units = createComplexCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd hh:ii:ss' }))

			expect(result.current({ timestamp: 0 })).toBe('1 00:00:00')
		})

		it('formats noon of day 1', () => {
			const units = createComplexCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd hh:ii:ss' }))

			// 12 hours * 3600 = 43200
			expect(result.current({ timestamp: 43200 })).toBe('1 12:00:00')
		})

		it('formats 23:59:59', () => {
			const units = createComplexCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd hh:ii:ss' }))

			// 23*3600 + 59*60 + 59 = 82800 + 3540 + 59 = 86399
			expect(result.current({ timestamp: 86399 })).toBe('1 23:59:59')
		})

		it('formats first second of day 2', () => {
			const units = createComplexCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd hh:ii:ss' }))

			expect(result.current({ timestamp: 86400 })).toBe('2 00:00:00')
		})

		it('formats arbitrary time', () => {
			const units = createComplexCalendar()

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd hh:ii:ss' }))

			// Day 5, 14:30:45 = 4*86400 + 14*3600 + 30*60 + 45 = 345600 + 50400 + 1800 + 45 = 397845
			expect(result.current({ timestamp: 397845 })).toBe('5 14:30:45')
		})
	})

	describe('edge cases', () => {
		it('handles very large timestamps', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 1000000 })).toBe('1000000')
		})

		it('handles empty units array - format chars become literals', () => {
			const { result } = renderHook(() => useFormatTimestampUnits({ units: [], dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('D')
		})
	})

	describe('skipped child count accumulation', () => {
		it('continues counting when same displayName appears multiple times in children', () => {
			// Scenario: Year has [5 Frans, 10 Frenas, 5 Frans]
			// When we land in the SECOND set of Frans, count should continue from 5, not reset to 0
			const franUnit = createUnit({
				id: 'fran',
				name: 'Fran',
				displayName: 'Fran',
				duration: 1,
				formatShorthand: 'f',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [createParentRelation('year', 'fran', 5), createParentRelation('year', 'fran', 5)],
			})

			const frenaUnit = createUnit({
				id: 'frena',
				name: 'Frena',
				displayName: 'Frena',
				duration: 1,
				formatShorthand: 'r',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [createParentRelation('year', 'frena', 10)],
			})

			const yearUnit = createUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 20, // 5 + 10 + 5
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					createChildRelation('year', 'fran', 5, { position: 0 }), // Frans 1-5
					createChildRelation('year', 'frena', 10, { position: 1 }), // Frenas 1-10
					createChildRelation('year', 'fran', 5, { position: 2 }), // Frans 6-10 (continues!)
				],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [yearUnit, franUnit, frenaUnit],
					dateFormatString: 'y f',
				}),
			)

			// Timestamp 0: First Fran (Fran 1)
			expect(result.current({ timestamp: 0 })).toBe('0 1')

			// Timestamp 4: Last of first Frans set (Fran 5)
			expect(result.current({ timestamp: 4 })).toBe('0 5')

			// Timestamp 15: First of second Frans set - should be Fran 6, not Fran 1
			expect(result.current({ timestamp: 15 })).toBe('0 6')

			// Timestamp 19: Last Fran (Fran 10)
			expect(result.current({ timestamp: 19 })).toBe('0 10')
		})

		it('accumulates correctly with three occurrences of same displayName', () => {
			// Year has [3 Days, 2 Nights, 3 Days, 2 Nights, 4 Days]
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const nightUnit = createUnit({
				id: 'night',
				name: 'Night',
				displayName: 'Night',
				duration: 1,
				formatShorthand: 'n',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const yearUnit = createUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 14, // 3 + 2 + 3 + 2 + 4
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					createChildRelation('year', 'day', 3, { position: 0 }), // Days 1-3
					createChildRelation('year', 'night', 2, { position: 1 }), // Nights 1-2
					createChildRelation('year', 'day', 3, { position: 2 }), // Days 4-6
					createChildRelation('year', 'night', 2, { position: 3 }), // Nights 3-4
					createChildRelation('year', 'day', 4, { position: 4 }), // Days 7-10
				],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [yearUnit, dayUnit, nightUnit],
					dateFormatString: 'y d',
				}),
			)

			// First batch of days (0-2): Days 1-3
			expect(result.current({ timestamp: 0 })).toBe('0 1')
			expect(result.current({ timestamp: 2 })).toBe('0 3')

			// Second batch of days (5-7): Days 4-6 (continues from 3)
			expect(result.current({ timestamp: 5 })).toBe('0 4')
			expect(result.current({ timestamp: 7 })).toBe('0 6')

			// Third batch of days (10-13): Days 7-10 (continues from 6)
			expect(result.current({ timestamp: 10 })).toBe('0 7')
			expect(result.current({ timestamp: 13 })).toBe('0 10')
		})

		it('tracks different displayNames independently', () => {
			// Year has [2 Days, 2 Nights, 2 Days]
			// Days should accumulate (1,2 then 3,4)
			// Nights should be independent (1,2)
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const nightUnit = createUnit({
				id: 'night',
				name: 'Night',
				displayName: 'Night',
				duration: 1,
				formatShorthand: 'n',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [],
			})

			const yearUnit = createUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 6, // 2 + 2 + 2
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					createChildRelation('year', 'day', 2, { position: 0 }),
					createChildRelation('year', 'night', 2, { position: 1 }),
					createChildRelation('year', 'day', 2, { position: 2 }),
				],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [yearUnit, dayUnit, nightUnit],
					dateFormatString: 'y d',
				}),
			)

			// First days (0-1): Day 1, Day 2
			expect(result.current({ timestamp: 0 })).toBe('0 1')
			expect(result.current({ timestamp: 1 })).toBe('0 2')

			// Second days (4-5): Day 3, Day 4 (accumulated from first 2 days)
			expect(result.current({ timestamp: 4 })).toBe('0 3')
			expect(result.current({ timestamp: 5 })).toBe('0 4')
		})
	})

	describe('child unit not found scenario', () => {
		it('handles missing child unit gracefully', () => {
			// Create a unit that references a non-existent child
			const parentUnit = createUnit({
				id: 'parent',
				name: 'Parent',
				duration: 10,
				formatShorthand: 'p',
				formatMode: 'Numeric',
				children: [createChildRelation('parent', 'missing-child', 10)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [parentUnit], dateFormatString: 'p' }),
			)

			// Should not crash, just return what it can
			expect(result.current({ timestamp: 15 })).toBe('1')
		})
	})

	describe('formatting with different duration ratios', () => {
		it('handles non-standard duration ratios', () => {
			// Create a calendar with 13-hour days
			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('day', 'hour', 13)],
			})

			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 13,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [createChildRelation('day', 'hour', 13)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, hourUnit], dateFormatString: 'd hh' }),
			)

			// Hour 14 is hour 1 of day 2
			expect(result.current({ timestamp: 14 })).toBe('2 01')
		})

		it('handles prime number durations', () => {
			// 7 hours per day, 11 days per week
			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('day', 'hour', 7)],
			})

			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 7,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [createChildRelation('day', 'hour', 7)],
				parents: [createParentRelation('week', 'day', 11)],
			})

			const weekUnit = createUnit({
				id: 'week',
				name: 'Week',
				duration: 77, // 7 * 11
				formatShorthand: 'w',
				formatMode: 'Numeric',
				children: [createChildRelation('week', 'day', 11)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [weekUnit, dayUnit, hourUnit], dateFormatString: 'w-d-h' }),
			)

			// Week 0, day 5, hour 3 = 5*7 + 3 = 38
			expect(result.current({ timestamp: 38 })).toBe('0-5-3')
		})
	})

	describe('duplicate format shorthands prevention', () => {
		it('uses first matching shorthand when duplicates exist across roots', () => {
			// Two roots with same shorthand - only first should be used
			const rootA = createUnit({
				id: 'root-a',
				name: 'Root A',
				duration: 1,
				formatShorthand: 'x',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [],
			})

			const rootB = createUnit({
				id: 'root-b',
				name: 'Root B',
				duration: 2,
				formatShorthand: 'x',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [rootA, rootB], dateFormatString: 'x' }),
			)

			// Root A (position 0) should be used, duration 1 means value = timestamp
			expect(result.current({ timestamp: 10 })).toBe('10')
		})
	})

	describe('special characters in format string', () => {
		it('handles format string with spaces', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd   d' }))

			// Multiple spaces preserved
			expect(result.current({ timestamp: 5 })).toBe('5   5')
		})

		it('handles format string with punctuation', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: '[d].(d)' }))

			expect(result.current({ timestamp: 5 })).toBe('[5].(5)')
		})

		it('handles format string with numbers as literals', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: '123d456' }))

			expect(result.current({ timestamp: 5 })).toBe('1235456')
		})
	})

	describe('deeply nested calendar hierarchies', () => {
		it('handles 5-level deep hierarchy', () => {
			const tickUnit = createUnit({
				id: 'tick',
				name: 'Tick',
				duration: 1,
				formatShorthand: 't',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('second', 'tick', 10)],
			})

			const secondUnit = createUnit({
				id: 'second',
				name: 'Second',
				duration: 10,
				formatShorthand: 's',
				formatMode: 'Numeric',
				children: [createChildRelation('second', 'tick', 10)],
				parents: [createParentRelation('minute', 'second', 60)],
			})

			const minuteUnit = createUnit({
				id: 'minute',
				name: 'Minute',
				duration: 600,
				formatShorthand: 'i',
				formatMode: 'Numeric',
				children: [createChildRelation('minute', 'second', 60)],
				parents: [createParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				duration: 36000,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [createChildRelation('hour', 'minute', 60)],
				parents: [createParentRelation('day', 'hour', 24)],
			})

			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 864000,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [createChildRelation('day', 'hour', 24)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [dayUnit, hourUnit, minuteUnit, secondUnit, tickUnit],
					dateFormatString: 'd h:ii:ss:t',
				}),
			)

			// Day 0, hour 1, minute 2, second 3, tick 4 = 36000 + 1200 + 30 + 4 = 37234
			expect(result.current({ timestamp: 37234 })).toBe('0 1:02:03:4')
		})
	})

	describe('minimal duration units', () => {
		it('handles unit with duration 1 (smallest possible)', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'unit',
					name: 'Unit',
					duration: 1,
					formatShorthand: 'u',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'u' }))

			expect(result.current({ timestamp: 0 })).toBe('0')
			expect(result.current({ timestamp: 1 })).toBe('1')
			expect(result.current({ timestamp: 100 })).toBe('100')
		})
	})

	describe('mixed format modes in hierarchy', () => {
		it('formats hierarchy with Name parent and Numeric children', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('week', 'day', 7)],
			})

			const weekUnit = createUnit({
				id: 'week',
				name: 'Week',
				displayName: 'Week',
				displayNameShort: 'W',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Name',
				children: [createChildRelation('week', 'day', 7)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [weekUnit, dayUnit], dateFormatString: 'ww, d' }),
			)

			// Week 1 (0-indexed Name mode shows "Week 01"), Day 3
			expect(result.current({ timestamp: 10 })).toBe('Week 01, 3')
		})

		it('formats hierarchy with Hidden intermediate and visible leaf', () => {
			const hourUnit = createUnit({
				id: 'hour',
				name: 'Hour',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [],
				parents: [createParentRelation('shift', 'hour', 8)],
			})

			const shiftUnit = createUnit({
				id: 'shift',
				name: 'Shift',
				duration: 8,
				formatShorthand: 's',
				formatMode: 'Hidden',
				children: [createChildRelation('shift', 'hour', 8)],
				parents: [createParentRelation('day', 'shift', 3)],
			})

			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 24,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [createChildRelation('day', 'shift', 3)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, shiftUnit, hourUnit], dateFormatString: 'd hh' }),
			)

			// Hour 20 is day 0, hour 20 (because shift is hidden, hours accumulate)
			expect(result.current({ timestamp: 20 })).toBe('0 20')
		})
	})

	describe('boundary conditions', () => {
		it('handles exact unit boundary transitions', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [createParentRelation('month', 'day', 30)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
				children: [createChildRelation('month', 'day', 30)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, dayUnit], dateFormatString: 'm-d' }),
			)

			// Last day of month 1
			expect(result.current({ timestamp: 29 })).toBe('1-30')
			// First day of month 2
			expect(result.current({ timestamp: 30 })).toBe('2-1')
		})

		it('handles timestamp just before rollover', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 100,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 99 })).toBe('0')
			expect(result.current({ timestamp: 100 })).toBe('1')
		})
	})

	describe('consecutive format characters for different units', () => {
		it('correctly separates consecutive different format characters', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [createParentRelation('month', 'day', 30)],
			})

			const monthUnit = createUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
				children: [createChildRelation('month', 'day', 30)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, dayUnit], dateFormatString: 'mmdd' }),
			)

			// Month 1, Day 15 = timestamp 14
			expect(result.current({ timestamp: 14 })).toBe('0115')
		})
	})

	describe('format with only padding', () => {
		it('pads single digit values appropriately', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'number',
					name: 'Number',
					duration: 1,
					formatShorthand: 'n',
					formatMode: 'NumericOneIndexed',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'nnnnnn' }))

			expect(result.current({ timestamp: 0 })).toBe('000001')
			expect(result.current({ timestamp: 999998 })).toBe('999999')
		})
	})

	describe('unicode and special display names', () => {
		it('handles unicode display names', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: '日',
					displayNameShort: '日',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Name',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('日 5')
		})

		it('handles emoji in display names', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					displayName: '🌞 Day',
					displayNameShort: '☀️',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Name',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('☀️ 5')
		})
	})

	describe('function reusability', () => {
		it('returned format function can be called multiple times with different timestamps', () => {
			const units: CalendarUnit[] = [
				createUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			const format = result.current
			expect(format({ timestamp: 0 })).toBe('0')
			expect(format({ timestamp: 42 })).toBe('42')
			expect(format({ timestamp: 100 })).toBe('100')
		})
	})

	describe('Hidden formatMode in format output', () => {
		it('returns empty string when formatting a Hidden unit directly', () => {
			// When a Hidden unit is matched in the format string, it returns ''
			// since it's neither Numeric nor Symbolic
			const hiddenUnit = createUnit({
				id: 'hidden',
				name: 'Hidden Unit',
				displayName: 'Hidden',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Hidden',
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [hiddenUnit], dateFormatString: 'h' }),
			)

			// Hidden units return empty string when formatted
			expect(result.current({ timestamp: 5 })).toBe('')
		})

		it('Hidden unit in format string produces empty output alongside visible units', () => {
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [],
			})

			const hiddenUnit = createUnit({
				id: 'hidden',
				name: 'Hidden',
				duration: 1,
				formatShorthand: 'h',
				formatMode: 'Hidden',
				children: [],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, hiddenUnit], dateFormatString: 'd-h' }),
			)

			// 'h' matches hidden unit which outputs '', so result is "5-"
			expect(result.current({ timestamp: 5 })).toBe('5-')
		})
	})

	describe('skipping hidden children accumulation', () => {
		it('skips past hidden children and accumulates their non-hidden descendants', () => {
			// This specifically tests line 89: when we skip a Hidden child,
			// we add its non-hidden children count to myExtraDuration
			// Year -> [Hidden Week (contains 7 Days), 3 Days]
			// When timestamp lands in the second set of Days, we skip the Hidden Week
			// and should accumulate the 7 days from it
			const dayUnit = createUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				children: [],
				parents: [createParentRelation('week', 'day', 7), createParentRelation('year', 'day', 3)],
			})

			const weekUnit = createUnit({
				id: 'week',
				name: 'Week',
				displayName: 'Week',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Hidden', // Hidden!
				children: [createChildRelation('week', 'day', 7)],
				parents: [createParentRelation('year', 'week', 1)],
			})

			const yearUnit = createUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 10, // 7 (week) + 3 (days)
				formatShorthand: 'y',
				formatMode: 'Numeric',
				children: [
					createChildRelation('year', 'week', 1, { position: 0 }), // Hidden week with 7 days
					createChildRelation('year', 'day', 3, { position: 1 }), // 3 more days
				],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [yearUnit, weekUnit, dayUnit],
					dateFormatString: 'y d',
				}),
			)

			// Timestamps 0-6 are in the Hidden Week, which contains days 1-7
			expect(result.current({ timestamp: 0 })).toBe('0 1')
			expect(result.current({ timestamp: 6 })).toBe('0 7')

			// Timestamps 7-9 are in the direct Days after the week
			// When we skip the Hidden Week, line 89 adds 7 (the week's days) to myExtraDuration
			// So these should be days 8, 9, 10
			expect(result.current({ timestamp: 7 })).toBe('0 8')
			expect(result.current({ timestamp: 8 })).toBe('0 9')
			expect(result.current({ timestamp: 9 })).toBe('0 10')
		})
	})
})
