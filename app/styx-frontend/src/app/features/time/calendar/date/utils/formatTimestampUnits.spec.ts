import { CalendarUnit } from '@api/types/calendarTypes'

import {
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { ParsedTimestamp } from '../types'
import { formatTimestampUnits } from './formatTimestampUnits'

/**
 * Helper to build a ParsedTimestamp map from entries.
 */
function buildParsed(
	...entries: {
		id: string
		unit: CalendarUnit
		value: number
		formatShorthand?: string
		customLabel?: string
	}[]
): ParsedTimestamp {
	const map: ParsedTimestamp = new Map()
	for (const e of entries) {
		map.set(e.id, {
			unit: e.unit,
			value: e.value,
			formatShorthand: e.formatShorthand ?? e.unit.formatShorthand ?? undefined,
			customLabel: e.customLabel,
		})
	}
	return map
}

describe('formatTimestampUnits', () => {
	describe('empty and invalid date format strings', () => {
		it('returns "No date format specified" for empty or whitespace-only format strings', () => {
			const units: CalendarUnit[] = [
				mockCalendarUnit({ id: 'day', name: 'Day', duration: 1, formatShorthand: 'd' }),
			]
			const parsed = buildParsed({ id: 'day', unit: units[0], value: 0, formatShorthand: 'd' })

			for (const dateFormat of ['', '   ', '\t\t', '\n']) {
				expect(formatTimestampUnits(units, parsed, dateFormat)).toBe('No date format specified')
			}
		})
	})

	describe('basic numeric formatting', () => {
		it('formats value 0 as "0"', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 0 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('0')
		})

		it('formats value 5 as "5"', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('5')
		})

		it('pads numbers when multiple format characters are used', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'ddd')).toBe('005')
		})

		it('does not truncate numbers larger than padding', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 1234 })

			expect(formatTimestampUnits([unit], parsed, 'dd')).toBe('1234')
		})
	})

	describe('NumericOneIndexed format mode', () => {
		it('formats value 0 as "1" (adds 1 for non-negative values)', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 0 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('1')
		})

		it('formats value 9 as "10"', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 9 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('10')
		})

		it('pads one-indexed numbers correctly', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 0 })

			expect(formatTimestampUnits([unit], parsed, 'ddd')).toBe('001')
		})
	})

	describe('Name format mode', () => {
		it('shows short display name with single format character', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('D 5')
		})

		it('shows full display name with multiple format characters', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'dd')).toBe('Day 05')
		})
	})

	describe('NameOneIndexed format mode', () => {
		it('shows short display name with 1-indexed value', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NameOneIndexed',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 0 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('D 1')
		})

		it('shows full display name with multiple format characters and 1-indexed value', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: 'Day',
				displayNameShort: 'D',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NameOneIndexed',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 4 })

			expect(formatTimestampUnits([unit], parsed, 'dd')).toBe('Day 05')
		})
	})

	describe('format string with literal characters', () => {
		it('preserves unrecognized characters in format string', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			// "Day: " are literals, 'd' matches unit
			// Note: 'D' is matched case-insensitively to 'd', then 'a', 'y' are literals
			expect(formatTimestampUnits([unit], parsed, 'Day: d')).toBe('Day: 5')
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

			const parsed = buildParsed(
				{ id: 'month', unit: monthUnit, value: 1, formatShorthand: 'm' },
				{ id: 'day', unit: dayUnit, value: 5, formatShorthand: 'd' },
			)

			expect(formatTimestampUnits([monthUnit, dayUnit], parsed, 'm/dd')).toBe('1/05')
		})
	})

	describe('case sensitivity', () => {
		it('matches case-insensitively when format has only one case', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'D',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5, formatShorthand: 'D' })

			// Format uses 'd' (lowercase), unit has 'D' (uppercase) — should match case-insensitively
			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('5')
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

			const parsed = buildParsed(
				{ id: 'decade', unit: decadeUnit, value: 1, formatShorthand: 'D' },
				{ id: 'day', unit: dayUnit, value: 15, formatShorthand: 'd' },
			)

			expect(formatTimestampUnits([dayUnit, decadeUnit], parsed, 'D-d')).toBe('1-15')
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
				duration: 43200,
				formatShorthand: 'M',
				formatMode: 'Name',
				displayName: 'January',
				displayNameShort: 'Jan',
				children: [mockCalendarUnitChildRelation('month', 'hour', 720)],
				parents: [],
			})

			const parsed = buildParsed(
				{ id: 'hour', unit: hourUnit, value: 1, formatShorthand: 'h' },
				{ id: 'minute', unit: minuteUnit, value: 1, formatShorthand: 'm' },
				{ id: 'month', unit: monthUnit, value: 0, formatShorthand: 'M' },
			)

			// 'mm' should match minute (lowercase 'm'), not Month (uppercase 'M')
			expect(formatTimestampUnits([monthUnit, hourUnit, minuteUnit], parsed, 'hh:mm')).toBe('01:01')
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
				duration: 43200,
				formatShorthand: 'M',
				formatMode: 'NameOneIndexed',
				children: [mockCalendarUnitChildRelation('month', 'hour', 720)],
				parents: [],
			})

			const parsed = buildParsed(
				{ id: 'hour', unit: hourUnit, value: 1, formatShorthand: 'h' },
				{ id: 'minute', unit: minuteUnit, value: 1, formatShorthand: 'm' },
				{ id: 'month', unit: monthUnit, value: 0, formatShorthand: 'M' },
			)

			// 'M' should match Month (uppercase 'M'), 'mm' should match minute (lowercase 'm')
			expect(formatTimestampUnits([monthUnit, hourUnit, minuteUnit], parsed, 'M hh:mm')).toBe('Mon 1 01:01')
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
			const parsed1 = buildParsed(
				{ id: 'month', unit: monthUnit, value: 0, formatShorthand: 'm' },
				{ id: 'day', unit: dayUnit, value: 5, formatShorthand: 'd', customLabel: 'Festival Day' },
			)
			expect(formatTimestampUnits([monthUnit, dayUnit], parsed1, 'm d')).toBe('0 Festival Day')

			// Multiple symbols - still uses label, not display name
			const parsed2 = buildParsed(
				{ id: 'month', unit: monthUnit, value: 0, formatShorthand: 'm' },
				{ id: 'day', unit: dayUnit, value: 5, formatShorthand: 'd', customLabel: 'Festival Day' },
			)
			expect(formatTimestampUnits([monthUnit, dayUnit], parsed2, 'm ddd')).toBe('0 Festival Day')
		})
	})

	describe('units with no matching format shorthand', () => {
		it('preserves format characters that do not match any unit', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'xxx d')).toBe('xxx 5')
		})
	})

	describe('units with null formatShorthand', () => {
		it('skips units with null formatShorthand', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: null,
				formatMode: 'Numeric',
			})
			// Unit not in parsed map (null shorthand means it wouldn't be parsed)
			const parsed: ParsedTimestamp = new Map()

			// 'd' doesn't match anything, so treated as literal
			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('d')
		})
	})

	describe('empty units array', () => {
		it('treats all format chars as literals', () => {
			const parsed: ParsedTimestamp = new Map()

			expect(formatTimestampUnits([], parsed, 'd')).toBe('d')
		})
	})

	describe('hierarchical formatting', () => {
		it('formats year-month-day from parsed values', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
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
				duration: 360,
				formatShorthand: 'y',
				formatMode: 'Numeric',
				position: 0,
				children: [mockCalendarUnitChildRelation('year', 'month', 12)],
				parents: [],
			})

			const units = [yearUnit, monthUnit, dayUnit]

			// Year 0, month 0, day 0 → "0-01-01"
			const parsed0 = buildParsed(
				{ id: 'year', unit: yearUnit, value: 0 },
				{ id: 'month', unit: monthUnit, value: 0 },
				{ id: 'day', unit: dayUnit, value: 0 },
			)
			expect(formatTimestampUnits(units, parsed0, 'y-mm-dd')).toBe('0-01-01')

			// Year 0, month 0, day 14 → "0-01-15"
			const parsed14 = buildParsed(
				{ id: 'year', unit: yearUnit, value: 0 },
				{ id: 'month', unit: monthUnit, value: 0 },
				{ id: 'day', unit: dayUnit, value: 14 },
			)
			expect(formatTimestampUnits(units, parsed14, 'y-mm-dd')).toBe('0-01-15')

			// Year 0, month 1, day 0 → "0-02-01"
			const parsed30 = buildParsed(
				{ id: 'year', unit: yearUnit, value: 0 },
				{ id: 'month', unit: monthUnit, value: 1 },
				{ id: 'day', unit: dayUnit, value: 0 },
			)
			expect(formatTimestampUnits(units, parsed30, 'y-mm-dd')).toBe('0-02-01')

			// Year 100, month 5, day 14 → "0100-06-15"
			const parsedLarge = buildParsed(
				{ id: 'year', unit: yearUnit, value: 100 },
				{ id: 'month', unit: monthUnit, value: 5 },
				{ id: 'day', unit: dayUnit, value: 14 },
			)
			expect(formatTimestampUnits(units, parsedLarge, 'yyyy-mm-dd')).toBe('0100-06-15')
		})
	})

	describe('complex time format (day hh:ii:ss)', () => {
		const createUnits = () => {
			const secondUnit = mockCalendarUnit({
				id: 'second',
				name: 'Second',
				duration: 1,
				formatShorthand: 's',
				formatMode: 'Numeric',
				position: 3,
			})

			const minuteUnit = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 60,
				formatShorthand: 'i',
				formatMode: 'Numeric',
				position: 2,
			})

			const hourUnit = mockCalendarUnit({
				id: 'hour',
				name: 'Hour',
				duration: 3600,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 1,
			})

			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 86400,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 0,
			})

			return [dayUnit, hourUnit, minuteUnit, secondUnit]
		}

		it('formats midnight of day 1', () => {
			const units = createUnits()
			const parsed = buildParsed(
				{ id: 'day', unit: units[0], value: 0 },
				{ id: 'hour', unit: units[1], value: 0 },
				{ id: 'minute', unit: units[2], value: 0 },
				{ id: 'second', unit: units[3], value: 0 },
			)

			expect(formatTimestampUnits(units, parsed, 'd hh:ii:ss')).toBe('1 00:00:00')
		})

		it('formats noon of day 1', () => {
			const units = createUnits()
			const parsed = buildParsed(
				{ id: 'day', unit: units[0], value: 0 },
				{ id: 'hour', unit: units[1], value: 12 },
				{ id: 'minute', unit: units[2], value: 0 },
				{ id: 'second', unit: units[3], value: 0 },
			)

			expect(formatTimestampUnits(units, parsed, 'd hh:ii:ss')).toBe('1 12:00:00')
		})

		it('formats 23:59:59', () => {
			const units = createUnits()
			const parsed = buildParsed(
				{ id: 'day', unit: units[0], value: 0 },
				{ id: 'hour', unit: units[1], value: 23 },
				{ id: 'minute', unit: units[2], value: 59 },
				{ id: 'second', unit: units[3], value: 59 },
			)

			expect(formatTimestampUnits(units, parsed, 'd hh:ii:ss')).toBe('1 23:59:59')
		})

		it('formats day 5, 14:30:45', () => {
			const units = createUnits()
			const parsed = buildParsed(
				{ id: 'day', unit: units[0], value: 4 },
				{ id: 'hour', unit: units[1], value: 14 },
				{ id: 'minute', unit: units[2], value: 30 },
				{ id: 'second', unit: units[3], value: 45 },
			)

			expect(formatTimestampUnits(units, parsed, 'd hh:ii:ss')).toBe('5 14:30:45')
		})
	})

	describe('special characters in format string', () => {
		it('handles format string with spaces', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'd   d')).toBe('5   5')
		})

		it('handles format string with punctuation', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, '[d].(d)')).toBe('[5].(5)')
		})

		it('handles format string with numbers as literals', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, '123d456')).toBe('1235456')
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

			const parsed = buildParsed(
				{ id: 'month', unit: monthUnit, value: 0 },
				{ id: 'day', unit: dayUnit, value: 14 },
			)

			expect(formatTimestampUnits([monthUnit, dayUnit], parsed, 'mmdd')).toBe('0115')
		})
	})

	describe('format with only padding', () => {
		it('pads single digit values appropriately', () => {
			const unit = mockCalendarUnit({
				id: 'number',
				name: 'Number',
				duration: 1,
				formatShorthand: 'n',
				formatMode: 'NumericOneIndexed',
			})

			const parsed0 = buildParsed({ id: 'number', unit, value: 0 })
			expect(formatTimestampUnits([unit], parsed0, 'nnnnnn')).toBe('000001')

			const parsedLarge = buildParsed({ id: 'number', unit, value: 999998 })
			expect(formatTimestampUnits([unit], parsedLarge, 'nnnnnn')).toBe('999999')
		})
	})

	describe('unicode and special display names', () => {
		it('handles unicode display names', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: '日',
				displayNameShort: '日',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('日 5')
		})

		it('handles emoji in display names', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				displayName: '🌞 Day',
				displayNameShort: '☀️',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Name',
			})
			const parsed = buildParsed({ id: 'day', unit, value: 5 })

			expect(formatTimestampUnits([unit], parsed, 'd')).toBe('☀️ 5')
		})
	})

	describe('Hidden formatMode in format output', () => {
		it('returns empty string when formatting a Hidden unit directly', () => {
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
			const parsed = buildParsed({ id: 'hidden', unit: hiddenUnit, value: 5 })

			expect(formatTimestampUnits([hiddenUnit], parsed, 'h')).toBe('')
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

			const parsed = buildParsed(
				{ id: 'day', unit: dayUnit, value: 5 },
				{ id: 'hidden', unit: hiddenUnit, value: 5 },
			)

			// 'h' matches hidden unit which outputs '', so result is "5-"
			expect(formatTimestampUnits([dayUnit, hiddenUnit], parsed, 'd-h')).toBe('5-')
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

			const parsed = buildParsed(
				{ id: 'week', unit: weekUnit, value: 1 },
				{ id: 'day', unit: dayUnit, value: 3 },
			)

			// Week 1 (Name mode shows "Week 01"), Day 3
			expect(formatTimestampUnits([weekUnit, dayUnit], parsed, 'ww, d')).toBe('Week 01, 3')
		})
	})

	describe('negative value formatting', () => {
		it('formats negative value for simple Numeric unit', () => {
			const unit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'Numeric',
			})

			const parsedN1 = buildParsed({ id: 'day', unit, value: -1 })
			expect(formatTimestampUnits([unit], parsedN1, 'd')).toBe('-1')

			const parsedN5 = buildParsed({ id: 'day', unit, value: -5 })
			expect(formatTimestampUnits([unit], parsedN5, 'd')).toBe('-5')

			const parsedN100 = buildParsed({ id: 'day', unit, value: -100 })
			expect(formatTimestampUnits([unit], parsedN100, 'd')).toBe('-100')
		})

		it('pads negative values correctly (pads absolute value, prepends minus)', () => {
			const unit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				duration: 360,
				formatShorthand: 'y',
				formatMode: 'Numeric',
			})

			const parsed = buildParsed({ id: 'year', unit, value: -1 })
			expect(formatTimestampUnits([unit], parsed, 'yyyy')).toBe('-0001')
		})

		it('formats negative year with OneIndexed children in positive range', () => {
			const dayUnit = mockCalendarUnit({
				id: 'day',
				name: 'Day',
				duration: 1,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
			})

			const monthUnit = mockCalendarUnit({
				id: 'month',
				name: 'Month',
				duration: 30,
				formatShorthand: 'm',
				formatMode: 'NumericOneIndexed',
			})

			const yearUnit = mockCalendarUnit({
				id: 'year',
				name: 'Year',
				duration: 360,
				formatShorthand: 'y',
				formatMode: 'Numeric',
			})

			const units = [yearUnit, monthUnit, dayUnit]

			// Year -1, month 11, day 29 → "-1-12-30"
			const parsed = buildParsed(
				{ id: 'year', unit: yearUnit, value: -1 },
				{ id: 'month', unit: monthUnit, value: 11 },
				{ id: 'day', unit: dayUnit, value: 29 },
			)
			expect(formatTimestampUnits(units, parsed, 'y-mm-dd')).toBe('-1-12-30')
		})
	})
})
