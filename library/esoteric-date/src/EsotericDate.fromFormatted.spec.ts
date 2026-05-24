import { WorldCalendar } from '@api/types/worldTypes'
import { describe, expect, it } from 'vitest'

import {
	mockCalendar,
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { EsotericDate } from './EsotericDate'

/**
 * Asserts the central contract: fromFormatted(format(x)) === x for every
 * timestamp, i.e. formatting and then parsing back is a perfect round-trip.
 */
function expectRoundTrip(calendar: WorldCalendar, timestamps: number[]) {
	for (const timestamp of timestamps) {
		const formatted = new EsotericDate(calendar, timestamp).format()
		const parsed = new EsotericDate(calendar, 0).fromFormatted(formatted)
		expect(parsed.getTimestamp(), `"${formatted}" (from t=${timestamp})`).toBe(timestamp)
	}
}

describe('EsotericDate.fromFormatted', () => {
	describe('single numeric unit', () => {
		const calendar = mockCalendar({
			dateFormat: 'd',
			units: [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
				}),
			],
		})

		it('round-trips positive, zero, negative and large values', () => {
			expectRoundTrip(calendar, [0, 1, 5, 42, 1000, 999999, -1, -5, -1000])
		})

		it('parses a known value', () => {
			expect(new EsotericDate(calendar, 0).fromFormatted('42').getTimestamp()).toBe(42)
			expect(new EsotericDate(calendar, 0).fromFormatted('-7').getTimestamp()).toBe(-7)
		})
	})

	describe('hierarchical year-month-day (one-indexed month/day)', () => {
		const calendar = mockCalendar({
			dateFormat: 'y-mm-dd',
			units: [
				mockCalendarUnit({
					id: 'year',
					name: 'Year',
					duration: 360,
					formatShorthand: 'y',
					formatMode: 'Numeric',
					position: 0,
					children: [mockCalendarUnitChildRelation('year', 'month', 12)],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'month',
					name: 'Month',
					duration: 30,
					formatShorthand: 'm',
					formatMode: 'NumericOneIndexed',
					position: 1,
					children: [mockCalendarUnitChildRelation('month', 'day', 30)],
					parents: [mockCalendarUnitParentRelation('year', 'month', 12)],
				}),
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 2,
					children: [],
					parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
				}),
			],
		})

		it('round-trips across month and year boundaries', () => {
			expectRoundTrip(calendar, [0, 14, 29, 30, 359, 360, 36164])
		})

		it('round-trips negative timestamps', () => {
			expectRoundTrip(calendar, [-1, -30, -31, -360, -361])
		})

		it('parses known formatted strings', () => {
			expect(new EsotericDate(calendar, 0).fromFormatted('0-01-01').getTimestamp()).toBe(0)
			expect(new EsotericDate(calendar, 0).fromFormatted('100-06-15').getTimestamp()).toBe(36164)
			expect(new EsotericDate(calendar, 0).fromFormatted('-1-12-30').getTimestamp()).toBe(-1)
		})
	})

	describe('Name and NameOneIndexed format modes', () => {
		const calendar = mockCalendar({
			// Name parent (full name when doubled), numeric child
			dateFormat: 'mmm d',
			units: [
				mockCalendarUnit({
					id: 'month',
					name: 'Month',
					displayName: 'Month',
					displayNameShort: 'Mon',
					duration: 30,
					formatShorthand: 'm',
					formatMode: 'NameOneIndexed',
					position: 0,
					children: [mockCalendarUnitChildRelation('month', 'day', 30)],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'Numeric',
					position: 1,
					children: [],
					parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
				}),
			],
		})

		it('round-trips with full display name', () => {
			expectRoundTrip(calendar, [0, 5, 29, 30, 65, 359])
		})

		it('renders and parses the display name form', () => {
			const formatted = new EsotericDate(calendar, 65).format()
			expect(formatted).toBe('Month 003 5')
			expect(new EsotericDate(calendar, 0).fromFormatted(formatted).getTimestamp()).toBe(65)
		})

		it('round-trips with short display name (single symbol)', () => {
			const shortCalendar = mockCalendar({ ...calendar, dateFormat: 'm d' })
			expect(new EsotericDate(shortCalendar, 65).format()).toBe('Mon 3 5')
			expectRoundTrip(shortCalendar, [0, 5, 65, 359])
		})
	})

	describe('complex time format with separators', () => {
		const calendar = mockCalendar({
			dateFormat: 'd hh:ii:ss',
			units: [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 86400,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 0,
					children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'hour',
					name: 'Hour',
					duration: 3600,
					formatShorthand: 'h',
					formatMode: 'Numeric',
					position: 1,
					children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
					parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
				}),
				mockCalendarUnit({
					id: 'minute',
					name: 'Minute',
					duration: 60,
					formatShorthand: 'i',
					formatMode: 'Numeric',
					position: 2,
					children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
					parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
				}),
				mockCalendarUnit({
					id: 'second',
					name: 'Second',
					duration: 1,
					formatShorthand: 's',
					formatMode: 'Numeric',
					position: 3,
					children: [],
					parents: [mockCalendarUnitParentRelation('minute', 'second', 60)],
				}),
			],
		})

		it('round-trips a variety of times', () => {
			expectRoundTrip(calendar, [0, 43200, 86399, 86400, 397845, -1, -86400])
		})

		it('parses a known time', () => {
			expect(new EsotericDate(calendar, 397845).format()).toBe('5 14:30:45')
			expect(new EsotericDate(calendar, 0).fromFormatted('5 14:30:45').getTimestamp()).toBe(397845)
		})
	})

	describe('adjacent numeric fields with no separator', () => {
		const calendar = mockCalendar({
			dateFormat: 'mmdd',
			units: [
				mockCalendarUnit({
					id: 'month',
					name: 'Month',
					duration: 30,
					formatShorthand: 'm',
					formatMode: 'NumericOneIndexed',
					position: 0,
					children: [mockCalendarUnitChildRelation('month', 'day', 30)],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 1,
					children: [],
					parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
				}),
			],
		})

		it('round-trips using fixed-width padding to disambiguate', () => {
			expect(new EsotericDate(calendar, 14).format()).toBe('0115')
			expectRoundTrip(calendar, [0, 14, 29, 30, 59, 359])
		})
	})

	describe('multiple parallel root units', () => {
		const calendar = mockCalendar({
			dateFormat: 'd h',
			units: [
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 10,
					formatShorthand: 'd',
					formatMode: 'Numeric',
					position: 1,
					children: [],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'hour',
					name: 'Hour',
					duration: 1,
					formatShorthand: 'h',
					formatMode: 'Numeric',
					position: 0,
					children: [],
					parents: [],
				}),
			],
		})

		it('round-trips (smallest-duration root determines the timestamp)', () => {
			expectRoundTrip(calendar, [0, 1, 5, 9, 10, 15, 50, 100])
		})
	})

	describe('multiple roots sharing the same leaf unit', () => {
		const makeCalendar = (monthPosition: number, weekPosition: number) =>
			mockCalendar({
				dateFormat: 'M-d (w)',
				units: [
					mockCalendarUnit({
						id: 'month',
						name: 'Month',
						duration: 12,
						formatShorthand: 'M',
						formatMode: 'Numeric',
						position: monthPosition,
						children: [mockCalendarUnitChildRelation('month', 'day', 12)],
						parents: [],
					}),
					mockCalendarUnit({
						id: 'week',
						name: 'Week',
						duration: 7,
						formatShorthand: 'w',
						formatMode: 'Numeric',
						position: weekPosition,
						children: [mockCalendarUnitChildRelation('week', 'day', 7)],
						parents: [],
					}),
					mockCalendarUnit({
						id: 'day',
						name: 'Day',
						duration: 1,
						formatShorthand: 'd',
						formatMode: 'Numeric',
						position: 2,
						children: [],
						parents: [
							mockCalendarUnitParentRelation('month', 'day', 12),
							mockCalendarUnitParentRelation('week', 'day', 7),
						],
					}),
				],
			})

		const samples = [0, 5, 7, 12, 13, 20, 83, 84]

		it('resolves through the lower-position root (month first)', () => {
			const calendar = makeCalendar(0, 1)
			expect(new EsotericDate(calendar, 20).format()).toBe('1-8 (2)')
			expect(new EsotericDate(calendar, 0).fromFormatted('1-8 (2)').getTimestamp()).toBe(20)
			expectRoundTrip(calendar, samples)
		})

		it('resolves through the lower-position root (week first)', () => {
			const calendar = makeCalendar(1, 0)
			expect(new EsotericDate(calendar, 20).format()).toBe('1-6 (2)')
			expect(new EsotericDate(calendar, 0).fromFormatted('1-6 (2)').getTimestamp()).toBe(20)
			expectRoundTrip(calendar, samples)
		})
	})

	describe('originTime offset', () => {
		const makeCalendar = (originTime: number) =>
			mockCalendar({
				dateFormat: 'y-mm-dd',
				originTime,
				units: [
					mockCalendarUnit({
						id: 'year',
						name: 'Year',
						duration: 360,
						formatShorthand: 'y',
						formatMode: 'Numeric',
						position: 0,
						children: [mockCalendarUnitChildRelation('year', 'month', 12)],
						parents: [],
					}),
					mockCalendarUnit({
						id: 'month',
						name: 'Month',
						duration: 30,
						formatShorthand: 'm',
						formatMode: 'NumericOneIndexed',
						position: 1,
						children: [mockCalendarUnitChildRelation('month', 'day', 30)],
						parents: [mockCalendarUnitParentRelation('year', 'month', 12)],
					}),
					mockCalendarUnit({
						id: 'day',
						name: 'Day',
						duration: 1,
						formatShorthand: 'd',
						formatMode: 'NumericOneIndexed',
						position: 2,
						children: [],
						parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
					}),
				],
			})

		it('round-trips with a non-zero origin', () => {
			expectRoundTrip(makeCalendar(360), [0, 14, 360, -360])
		})

		it('displayed date includes the origin shift', () => {
			expect(new EsotericDate(makeCalendar(360), 0).format()).toBe('1-01-01')
			expect(new EsotericDate(makeCalendar(360), 0).fromFormatted('1-01-01').getTimestamp()).toBe(0)
		})
	})

	// The important case: hidden intermediate units (leap-year cycles) carry no
	// characters in the formatted output, yet the round-trip must still resolve
	// them via the calendar structure rather than ignoring them.
	describe('hidden cycle units (esoteric 2-2-1-1-1 leap calendar)', () => {
		const REGULAR_YEAR = 365
		const LEAP_YEAR = 366
		const FIVE_YEAR_CYCLE = 2 * REGULAR_YEAR + LEAP_YEAR + REGULAR_YEAR + LEAP_YEAR

		const calendar = mockCalendar({
			dateFormat: 'y/d',
			units: [
				mockCalendarUnit({
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
				}),
				mockCalendarUnit({
					id: 'regularYear',
					name: 'Regular year',
					displayName: 'Year',
					duration: REGULAR_YEAR,
					formatShorthand: 'y',
					formatMode: 'NumericOneIndexed',
					position: 0,
					children: [mockCalendarUnitChildRelation('regularYear', 'day', 365)],
					parents: [mockCalendarUnitParentRelation('fiveYearCycle', 'regularYear', 3)],
				}),
				mockCalendarUnit({
					id: 'leapYear',
					name: 'Leap year',
					displayName: 'Year',
					duration: LEAP_YEAR,
					formatShorthand: 'y',
					formatMode: 'NumericOneIndexed',
					position: 0,
					children: [mockCalendarUnitChildRelation('leapYear', 'day', 366)],
					parents: [mockCalendarUnitParentRelation('fiveYearCycle', 'leapYear', 2)],
				}),
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					displayName: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 1,
					children: [],
					parents: [
						mockCalendarUnitParentRelation('regularYear', 'day', 365),
						mockCalendarUnitParentRelation('leapYear', 'day', 366),
					],
				}),
			],
		})

		it('round-trips across every year type in the pattern', () => {
			expectRoundTrip(
				calendar,
				[
					0, 100, 364, 365, 500, 729, 730, 900, 1095, 1096, 1200, 1460, 1461, 1600, 1826, 1827, 2000, 3654,
					5481,
				],
			)
		})

		it('round-trips negative timestamps through hidden cycles', () => {
			expectRoundTrip(calendar, [-1, -365, -730, -1096, -1827, -3654])
		})

		it('round-trips exact and off-by-one cycle boundaries', () => {
			expectRoundTrip(calendar, [
				FIVE_YEAR_CYCLE - 1,
				FIVE_YEAR_CYCLE,
				FIVE_YEAR_CYCLE + 1,
				2 * REGULAR_YEAR - 1,
				2 * REGULAR_YEAR,
				2 * REGULAR_YEAR + LEAP_YEAR - 1,
				2 * REGULAR_YEAR + LEAP_YEAR,
				10 * FIVE_YEAR_CYCLE + 37,
			])
		})
	})

	describe('named units (custom relation labels)', () => {
		describe('mixed labelled and numeric slots', () => {
			const mixed = mockCalendar({
				dateFormat: 'mmm dd',
				units: [
					mockCalendarUnit({
						id: 'year',
						name: 'Year',
						duration: 90,
						formatShorthand: 'y',
						formatMode: 'Numeric',
						position: 0,
						children: [
							mockCalendarUnitChildRelation('year', 'month', 1, { id: 'ym-0', position: 0, label: 'Spring' }),
							mockCalendarUnitChildRelation('year', 'month', 1, { id: 'ym-1', position: 1, label: 'Summer' }),
							mockCalendarUnitChildRelation('year', 'month', 1, { id: 'ym-2', position: 2 }),
						],
						parents: [],
					}),
					mockCalendarUnit({
						id: 'month',
						name: 'Month',
						displayName: 'Month',
						displayNameShort: 'Mon',
						duration: 30,
						formatShorthand: 'm',
						formatMode: 'NameOneIndexed',
						position: 1,
						children: [mockCalendarUnitChildRelation('month', 'day', 30)],
						parents: [mockCalendarUnitParentRelation('year', 'month', 3)],
					}),
					mockCalendarUnit({
						id: 'day',
						name: 'Day',
						duration: 1,
						formatShorthand: 'd',
						formatMode: 'NumericOneIndexed',
						position: 2,
						children: [],
						parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
					}),
				],
			})

			it('formats labelled and unlabelled slots differently', () => {
				expect(new EsotericDate(mixed, 0 * 30 + 4).format()).toBe('Spring 05')
				expect(new EsotericDate(mixed, 2 * 30 + 4).format()).toBe('Month 003 05')
			})

			it('round-trips both forms', () => {
				expectRoundTrip(mixed, [0, 4, 30, 34, 60, 64, 89])
			})
		})
	})

	describe('error handling', () => {
		const calendar = mockCalendar({
			dateFormat: 'y-mm-dd',
			units: [
				mockCalendarUnit({
					id: 'year',
					name: 'Year',
					duration: 360,
					formatShorthand: 'y',
					formatMode: 'Numeric',
					position: 0,
					children: [mockCalendarUnitChildRelation('year', 'month', 12)],
					parents: [],
				}),
				mockCalendarUnit({
					id: 'month',
					name: 'Month',
					duration: 30,
					formatShorthand: 'm',
					formatMode: 'NumericOneIndexed',
					position: 1,
					children: [mockCalendarUnitChildRelation('month', 'day', 30)],
					parents: [mockCalendarUnitParentRelation('year', 'month', 12)],
				}),
				mockCalendarUnit({
					id: 'day',
					name: 'Day',
					duration: 1,
					formatShorthand: 'd',
					formatMode: 'NumericOneIndexed',
					position: 2,
					children: [],
					parents: [mockCalendarUnitParentRelation('month', 'day', 30)],
				}),
			],
		})

		it('throws when the string does not match the date format', () => {
			expect(() => new EsotericDate(calendar, 0).fromFormatted('not a date')).toThrow()
		})

		it('throws when no date format is configured', () => {
			const noFormat = mockCalendar({ ...calendar, dateFormat: '' })
			expect(() => new EsotericDate(noFormat, 0).fromFormatted('0-01-01')).toThrow('No date format specified')
		})
	})
})
