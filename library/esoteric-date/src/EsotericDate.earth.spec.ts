import { WorldCalendar } from '@api/types/worldTypes'
import { describe, expect, it } from 'vitest'

import {
	mockCalendar,
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'

import { EsotericDate } from './EsotericDate'

// Faithful reproduction of the production Gregorian (Earth) calendar template,
// which is the case the round-trip parser originally failed on:
//   - four distinct month-length units (28/29/30/31-day), all sharing the
//     "month" bucket and shorthand 'M'
//   - the twelve month names are relation labels spread across those four units
//   - regular and leap years share shorthand 'Y'
//   - a hidden 4-year cycle is the root, so February's length (and therefore
//     March's start) depends on the year — exactly what `value × duration`
//     resolution cannot reconstruct.
const MIN = 1
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const MONTHS_REGULAR: Array<[string, number]> = [
	['January', 31],
	['February', 28],
	['March', 31],
	['April', 30],
	['May', 31],
	['June', 30],
	['July', 31],
	['August', 31],
	['September', 30],
	['October', 31],
	['November', 30],
	['December', 31],
]
const MONTHS_LEAP: Array<[string, number]> = MONTHS_REGULAR.map(([n, d]) =>
	n === 'February' ? [n, 29] : [n, d],
)

const monthUnitId = (days: number) => `${days}-day-month`

function buildEarth(): WorldCalendar {
	const monthLengths = [28, 29, 30, 31]
	const monthUnits = monthLengths.map((days) =>
		mockCalendarUnit({
			id: monthUnitId(days),
			name: `${days}-day month`,
			displayName: 'month',
			displayNameShort: 'mon',
			duration: days * DAY,
			formatShorthand: 'M',
			formatMode: 'Name',
			position: 3,
			children: [mockCalendarUnitChildRelation(monthUnitId(days), 'day', days)],
			parents: [
				mockCalendarUnitParentRelation('regular-year', monthUnitId(days), 1),
				mockCalendarUnitParentRelation('leap-year', monthUnitId(days), 1),
			],
		}),
	)

	const yearChildren = (months: Array<[string, number]>, parentId: string) =>
		months.map(([label, days], i) =>
			mockCalendarUnitChildRelation(parentId, monthUnitId(days), 1, {
				id: `${parentId}-m${i}`,
				position: i,
				label,
			}),
		)

	return mockCalendar({
		dateFormat: 'hh:mm MM DD, YYYY',
		units: [
			mockCalendarUnit({
				id: 'minute',
				name: 'minute',
				displayName: 'minute',
				duration: MIN,
				formatShorthand: 'm',
				formatMode: 'Numeric',
				position: 0,
				children: [],
				parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
			}),
			mockCalendarUnit({
				id: 'hour',
				name: 'hour',
				displayName: 'hour',
				duration: HOUR,
				formatShorthand: 'h',
				formatMode: 'Numeric',
				position: 1,
				children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
				parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
			}),
			mockCalendarUnit({
				id: 'day',
				name: 'day',
				displayName: 'day',
				duration: DAY,
				formatShorthand: 'd',
				formatMode: 'NumericOneIndexed',
				position: 2,
				children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
				parents: monthLengths.map((days) => mockCalendarUnitParentRelation(monthUnitId(days), 'day', days)),
			}),
			...monthUnits,
			mockCalendarUnit({
				id: 'regular-year',
				name: 'Regular year',
				displayName: 'year',
				duration: 365 * DAY,
				formatShorthand: 'Y',
				formatMode: 'NumericOneIndexed',
				position: 4,
				children: yearChildren(MONTHS_REGULAR, 'regular-year'),
				parents: [mockCalendarUnitParentRelation('four-year-cycle', 'regular-year', 3)],
			}),
			mockCalendarUnit({
				id: 'leap-year',
				name: 'Leap year',
				displayName: 'year',
				duration: 366 * DAY,
				formatShorthand: 'Y',
				formatMode: 'NumericOneIndexed',
				position: 4,
				children: yearChildren(MONTHS_LEAP, 'leap-year'),
				parents: [mockCalendarUnitParentRelation('four-year-cycle', 'leap-year', 1)],
			}),
			mockCalendarUnit({
				id: 'four-year-cycle',
				name: '4-year cycle',
				displayName: '4-year cycle',
				duration: (365 * 3 + 366) * DAY,
				formatShorthand: null,
				formatMode: 'Hidden',
				position: 5,
				children: [
					mockCalendarUnitChildRelation('four-year-cycle', 'regular-year', 3, { position: 0 }),
					mockCalendarUnitChildRelation('four-year-cycle', 'leap-year', 1, { position: 1 }),
				],
				parents: [],
			}),
		],
	})
}

describe('EsotericDate — Gregorian (Earth) calendar', () => {
	const earth = buildEarth()

	const at = (ts: number) => new EsotericDate(earth, ts)
	const parse = (s: string) => new EsotericDate(earth, 0).fromFormatted(s).getTimestamp()

	it('parses the reported failing string', () => {
		// Years 0-2 are regular, year 3 is the leap year of the first cycle.
		expect(parse('00:00 January 01, 0001')).toBe(0)
	})

	it('parses month starts using preceding months’ real lengths', () => {
		// February starts after 31-day January.
		expect(parse('00:00 February 01, 0001')).toBe(31 * DAY)
		// March starts after Jan(31) + Feb(28) in a regular year.
		expect(parse('00:00 March 01, 0001')).toBe(59 * DAY)
		// December 31, the last day of a regular year.
		expect(parse('00:00 December 31, 0001')).toBe(364 * DAY)
	})

	it('honours leap years for February 29 and later months', () => {
		// Year index 3 (displayed 0004) is the leap year of the first cycle and
		// starts after three regular years.
		const leapYearStart = 3 * 365 * DAY
		// Feb 29 = Jan(31) + 28 more days into February.
		expect(at(leapYearStart + (31 + 28) * DAY).format()).toBe('00:00 February 29, 0004')
		expect(parse('00:00 February 29, 0004')).toBe(leapYearStart + (31 + 28) * DAY)
		// March 1 in the leap year sits one day later than in a regular year.
		expect(parse('00:00 March 01, 0004')).toBe(leapYearStart + 60 * DAY)
	})

	it('parse(format(t)) === t across months, leap boundaries, time of day and negatives', () => {
		const samples = [
			0,
			31 * DAY,
			59 * DAY,
			364 * DAY,
			365 * DAY, // start of year 2
			3 * 365 * DAY, // start of the leap year
			3 * 365 * DAY + (31 + 28) * DAY, // Feb 29
			1461 * DAY, // start of the second 4-year cycle
			8 * HOUR + 23 * MIN + 21 * DAY + 8 * 31 * DAY, // a September afternoon, year 0
			2300 * 365 * DAY + 575 * DAY, // far future, leap accumulation in play
			-1,
			-DAY,
			-365 * DAY,
		]
		for (const ts of samples) {
			const formatted = at(ts).format()
			expect(parse(formatted), `"${formatted}" (from t=${ts})`).toBe(ts)
		}
	})

	it('rejects an unknown month name', () => {
		expect(() => new EsotericDate(earth, 0).fromFormatted('00:00 Smarch 01, 0001')).toThrow()
	})
})
