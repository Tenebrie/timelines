import { CalendarUnit } from '@api/types/calendarTypes'
import { renderHook } from '@testing-library/react'

import {
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { useFormatTimestampUnits } from './useFormatTimestampUnits'

describe('useFormatTimestampUnits', () => {
	describe('empty and invalid date format strings', () => {
		it('returns "No date format specified" for empty or whitespace-only format strings', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
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
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 0 })).toBe('0')
		})

		it('formats timestamp 5 as 5 for a simple day unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

			expect(result.current({ timestamp: 5 })).toBe('5')
		})

		it('pads numbers when multiple format characters are used', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'ddd' }))

			expect(result.current({ timestamp: 5 })).toBe('005')
		})

		it('does not truncate numbers larger than padding', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			]

			const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'dd' }))

			expect(result.current({ timestamp: 1234 })).toBe('1234')
		})
	})

	describe('NumericOneIndexed format mode', () => {
		it('formats timestamp 0 as 1 for one-indexed unit', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('month', 'day', 30)],
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
				mockCalendarUnit({
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
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [],
			})

			const decadeUnit = mockCalendarUnit({
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

		it('disambiguates by case when format only uses lowercase but two units share the letter', () => {
			const minuteUnit = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 1,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 60,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
				parents: [mockCalendarUnitParentRelation('month', 'hour', 720)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 43200, // 720 hours * 60 minutes
				formatShorthand: 'M',
				formatMode: 'Name',
				displayName: 'January',
				displayNameShort: 'Jan',
				children: [mockCalendarUnitChildRelation('month', 'hour', 720)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [monthUnit, hourUnit, minuteUnit],
					dateFormatString: 'hh:mm',
				}),
			)

			// timestamp 61: hour = floor(61/60) = 1, minute = 61%60 = 1
			// 'mm' should match minute (lowercase 'm'), not Month (uppercase 'M')
			expect(result.current({ timestamp: 61 })).toBe('01:01')
		})

		it('disambiguates by case when format only uses uppercase but two units share the letter', () => {
			const minuteUnit = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 1,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 60,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
				parents: [mockCalendarUnitParentRelation('month', 'hour', 720)],
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				displayName: 'Month',
				displayNameShort: 'Mon',
				duration: 43200, // 720 hours * 60 minutes
				formatShorthand: 'M',
				formatMode: 'NameOneIndexed',
				children: [mockCalendarUnitChildRelation('month', 'hour', 720)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({
					units: [monthUnit, hourUnit, minuteUnit],
					dateFormatString: 'M hh:mm',
				}),
			)

			// timestamp 61: month = 0 (NameOneIndexed → 1), hour = 1, minute = 1
			// 'M' should match Month (uppercase 'M'), 'mm' should match minute (lowercase 'm')
			expect(result.current({ timestamp: 61 })).toBe('Mon 1 01:01')
		})
	})

	describe('Hidden format mode', () => {
		it('hidden units pass their count to children', () => {
			// Week is hidden, days show count within visible scope
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

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [monthUnit, weekUnit, dayUnit], dateFormatString: 'm-dd' }),
			)

			// Day 10 is in week 2 (hidden), should show as day 10 of month
			expect(result.current({ timestamp: 10 })).toBe('0-10')
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

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [hourUnit, dayUnit], dateFormatString: 'h:d' }),
			)

			// Both are roots with duration 1, so both show timestamp value
			expect(result.current({ timestamp: 10 })).toBe('10:10')
		})

		it('respects position ordering of root units', () => {
			const alphaUnit = mockCalendarUnit({
				id: 'alpha',
				name: 'Alpha',
				duration: 1,
				formatShorthand: 'a',
				formatMode: 'Numeric',
				position: 2,
				children: [],
				parents: [],
			})

			const betaUnit = mockCalendarUnit({
				id: 'beta',
				name: 'Beta',
				duration: 1,
				formatShorthand: 'b',
				formatMode: 'Numeric',
				position: 1,
				children: [],
				parents: [],
			})

			const gammaUnit = mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				duration: 20, // 5 + 10 + 5
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('year', 'fran', 5, { position: 0 }), // Frans 1-5
					mockCalendarUnitChildRelation('year', 'frena', 10, { position: 1 }), // Frenas 1-10
					mockCalendarUnitChildRelation('year', 'fran', 5, { position: 2 }), // Frans 6-10 (continues!)
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
				duration: 14, // 3 + 2 + 3 + 2 + 4
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 0 }), // Days 1-3
					mockCalendarUnitChildRelation('year', 'night', 2, { position: 1 }), // Nights 1-2
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 2 }), // Days 4-6
					mockCalendarUnitChildRelation('year', 'night', 2, { position: 3 }), // Nights 3-4
					mockCalendarUnitChildRelation('year', 'day', 4, { position: 4 }), // Days 7-10
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
				duration: 6, // 2 + 2 + 2
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
			const parentUnit = mockCalendarUnit({
				id: 'parent',
				name: 'Parent',
				duration: 10,
				formatShorthand: 'p',
				formatMode: 'Numeric',
				children: [mockCalendarUnitChildRelation('parent', 'missing-child', 10)],
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

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, hourUnit], dateFormatString: 'd hh' }),
			)

			// Hour 14 is hour 1 of day 2
			expect(result.current({ timestamp: 14 })).toBe('2 01')
		})

		it('handles prime number durations', () => {
			// 7 hours per day, 11 days per week
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [mockCalendarUnitParentRelation('week', 'day', 7)],
			})

			const weekUnit = mockCalendarUnit({
				id: 'week',
				name: 'Week',
				displayName: 'Week',
				displayNameShort: 'W',
				duration: 7,
				formatShorthand: 'w',
				formatMode: 'Name',
				children: [mockCalendarUnitChildRelation('week', 'day', 7)],
				parents: [],
			})

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [weekUnit, dayUnit], dateFormatString: 'ww, d' }),
			)

			// Week 1 (0-indexed Name mode shows "Week 01"), Day 3
			expect(result.current({ timestamp: 10 })).toBe('Week 01, 3')
		})

		it('formats hierarchy with Hidden intermediate and visible leaf', () => {
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

			const { result } = renderHook(() =>
				useFormatTimestampUnits({ units: [dayUnit, shiftUnit, hourUnit], dateFormatString: 'd hh' }),
			)

			// Hour 20 is day 0, hour 20 (because shift is hidden, hours accumulate)
			expect(result.current({ timestamp: 20 })).toBe('0 20')
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
				mockCalendarUnit({
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
			const hiddenUnit = mockCalendarUnit({
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
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
				children: [],
				parents: [],
			})

			const hiddenUnit = mockCalendarUnit({
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
				formatMode: 'Hidden', // Hidden!
				children: [mockCalendarUnitChildRelation('week', 'day', 7)],
				parents: [mockCalendarUnitParentRelation('year', 'week', 1)],
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				displayName: 'Year',
				duration: 10, // 7 (week) + 3 (days)
				formatShorthand: 'y',
				formatMode: 'Numeric',
				children: [
					mockCalendarUnitChildRelation('year', 'week', 1, { position: 0 }), // Hidden week with 7 days
					mockCalendarUnitChildRelation('year', 'day', 3, { position: 1 }), // 3 more days
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
					duration: 360, // 12 months * 30 days
					formatShorthand: 'y',
					formatMode: 'Numeric',
					position: 0,
					children: [mockCalendarUnitChildRelation('year', 'month', 12)],
					parents: [],
				})

				return [yearUnit, monthUnit, dayUnit]
			}

			it('timestamp -1 is last day of previous year', () => {
				const units = createSimpleCalendar()
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

				// timestamp -1 should be year -1, month 12, day 30
				expect(result.current({ timestamp: -1 })).toBe('-1-12-30')
			})

			it('timestamp -30 is first day of last month of previous year', () => {
				const units = createSimpleCalendar()
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

				// timestamp -30 should be year -1, month 12, day 1
				expect(result.current({ timestamp: -30 })).toBe('-1-12-01')
			})

			it('timestamp -31 is last day of 11th month of previous year', () => {
				const units = createSimpleCalendar()
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

				// timestamp -31 should be year -1, month 11, day 30
				expect(result.current({ timestamp: -31 })).toBe('-1-11-30')
			})

			it('timestamp -360 is first day of previous year', () => {
				const units = createSimpleCalendar()
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

				// timestamp -360 should be year -1, month 1, day 1
				expect(result.current({ timestamp: -360 })).toBe('-1-01-01')
			})

			it('timestamp -361 is last day of year -2', () => {
				const units = createSimpleCalendar()
				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'y-mm-dd' }))

				// timestamp -361 should be year -2, month 12, day 30
				expect(result.current({ timestamp: -361 })).toBe('-2-12-30')
			})
		})

		describe('calendar with hidden cycles (like Gregorian)', () => {
			const createGregorianCalendar = () => {
				// Actual Gregorian structure:
				// 400-year cycle (hidden) = 146097 days
				//   -> 3x 100-year cycle (hidden) = 36524 days each
				//   -> 25x 4-year cycle (hidden) = 1461 days each
				// 100-year cycle (hidden) = 36524 days
				//   -> 24x 4-year cycle (hidden) = 1461 days each
				//   -> 4x regular year = 365 days each
				// 4-year cycle (hidden) = 1461 days
				//   -> 3x regular year = 365 days
				//   -> 1x leap year = 366 days

				const MINUTE = 1
				const HOUR = 60 * MINUTE
				const DAY = 24 * HOUR
				const REGULAR_YEAR = 365 * DAY
				const LEAP_YEAR = 366 * DAY
				const FOUR_YEAR_CYCLE = 3 * REGULAR_YEAR + LEAP_YEAR // 1461 days
				const HUNDRED_YEAR_CYCLE = 24 * FOUR_YEAR_CYCLE + 4 * REGULAR_YEAR // 36524 days
				const FOUR_HUNDRED_YEAR_CYCLE = 3 * HUNDRED_YEAR_CYCLE + 25 * FOUR_YEAR_CYCLE // 146097 days

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

			it('timestamp 0 is year 1, day 1, 00:00', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'y/dd hh:ii' }),
				)

				expect(result.current({ timestamp: 0 })).toBe('1/01 00:00')
			})

			it('timestamp -1 is year 0, day 366, 23:59 (year 0 is a leap year)', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'y/ddd hh:ii' }),
				)

				// timestamp -1 is the last minute of year 0
				// Year 0 is the 4th year of the previous 4-year cycle, which is a leap year (366 days)
				expect(result.current({ timestamp: -1 })).toBe('-1/366 23:59')
			})

			it('timestamp -LEAP_YEAR is year 0, day 1, 00:00', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'y/ddd hh:ii' }),
				)

				// Going back exactly 1 leap year (366 days) from start of year 1
				expect(result.current({ timestamp: -LEAP_YEAR })).toBe('-1/001 00:00')
			})

			it('timestamp -(LEAP_YEAR + 1) is year -1, day 365, 23:59', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'y/ddd hh:ii' }),
				)

				// Going back 1 leap year + 1 minute from start of year 1
				// Year -1 is the 3rd year of the previous 4-year cycle = regular year (365 days)
				expect(result.current({ timestamp: -(LEAP_YEAR + 1) })).toBe('-2/365 23:59')
			})

			it('timestamp -(LEAP_YEAR + REGULAR_YEAR) is year -1, day 1, 00:00', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'y/ddd hh:ii' }),
				)

				// Going back 1 leap year + 1 regular year from start of year 1
				expect(result.current({ timestamp: -(LEAP_YEAR + REGULAR_YEAR) })).toBe('-2/001 00:00')
			})

			it('formats negative year with YYYY padding correctly', () => {
				const units = createGregorianCalendar()
				const { result } = renderHook(() =>
					useFormatTimestampUnits({ units, dateFormatString: 'yyyy/ddd hh:ii' }),
				)

				// Year 0, last minute
				expect(result.current({ timestamp: -1 })).toBe('-0001/366 23:59')

				// Going back further into negative years
				// With yyyy format, negative years get the padding applied to the absolute value, then minus prepended
				// So year -1 with yyyy becomes -0001 (minus + 4 digits)
				expect(result.current({ timestamp: -LEAP_YEAR })).toBe('-0001/001 00:00')
				expect(result.current({ timestamp: -(LEAP_YEAR + 1) })).toBe('-0002/365 23:59')
			})
		})

		describe('basic negative timestamp formatting', () => {
			it('formats negative timestamp for simple day unit', () => {
				const units: CalendarUnit[] = [
					mockCalendarUnit({
						id: 'day',
						name: 'Day',
						duration: 1,
						formatShorthand: 'd',
						formatMode: 'Numeric',
					}),
				]

				const { result } = renderHook(() => useFormatTimestampUnits({ units, dateFormatString: 'd' }))

				expect(result.current({ timestamp: -1 })).toBe('-1')
				expect(result.current({ timestamp: -5 })).toBe('-5')
				expect(result.current({ timestamp: -100 })).toBe('-100')
			})
		})
	})
})
