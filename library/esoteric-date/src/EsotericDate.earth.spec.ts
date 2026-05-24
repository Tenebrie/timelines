import { describe, expect, it } from 'vitest'

import { EARTH, mockEarthCalendar } from '@/api/mock/rheaModels.mock'

import { EsotericDate } from './EsotericDate'

describe('EsotericDate — Gregorian (Earth) calendar', () => {
	const { DAY } = EARTH
	const earth = mockEarthCalendar()

	const at = (ts: number) => new EsotericDate(earth, ts)
	const parse = (s: string) => new EsotericDate(earth, 0).fromFormatted(s).getTimestamp()

	it('parses the reported failing string', () => {
		expect(parse('00:00 January 01, 0001')).toBe(0)
	})

	it('parses month starts using preceding months’ real lengths', () => {
		expect(parse('00:00 February 01, 0001')).toBe(31 * DAY)
		expect(parse('00:00 March 01, 0001')).toBe(59 * DAY)
		expect(parse('00:00 December 31, 0001')).toBe(364 * DAY)
	})

	it('honours leap years for February 29 and later months', () => {
		const leapYearStart = 3 * 365 * DAY
		expect(at(leapYearStart + (31 + 28) * DAY).format()).toBe('00:00 February 29, 0004')
		expect(parse('00:00 February 29, 0004')).toBe(leapYearStart + (31 + 28) * DAY)
		expect(parse('00:00 March 01, 0004')).toBe(leapYearStart + 60 * DAY)
	})

	it('applies the 100/400-year leap rules via year lengths', () => {
		const yearLength = (displayedYear: number) =>
			parse(`00:00 January 01, ${displayedYear + 1}`) - parse(`00:00 January 01, ${displayedYear}`)

		expect(yearLength(1999)).toBe(365 * DAY)
		expect(yearLength(1900)).toBe(365 * DAY)
		expect(yearLength(2000)).toBe(366 * DAY)
		expect(yearLength(2004)).toBe(366 * DAY)
	})

	it('parse(format(t)) === t across months, leap boundaries, time of day and negatives', () => {
		const samples = [
			0,
			31 * DAY,
			59 * DAY,
			364 * DAY,
			365 * DAY,
			3 * 365 * DAY,
			3 * 365 * DAY + (31 + 28) * DAY,
			1461 * DAY,
			8 * EARTH.HOUR + 23 * EARTH.MINUTE + 21 * DAY + 8 * 31 * DAY,
			2300 * 365 * DAY + 575 * DAY,
			-1,
			-DAY,
			-365 * DAY,
		]
		for (const ts of samples) {
			const formatted = at(ts).format()
			expect(parse(formatted), `"${formatted}" (from t=${ts})`).toBe(ts)
		}
	})

	it('round-trips the first of every month', () => {
		const monthStarts = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
		for (const startDay of monthStarts) {
			const ts = startDay * DAY
			expect(parse(at(ts).format()), `month starting on day ${startDay}`).toBe(ts)
		}
	})

	it('round-trips an explicit date-time string', () => {
		const formatted = '08:23 September 22, 2300'
		expect(at(parse(formatted)).format()).toBe(formatted)
	})

	it('rejects an unknown month name', () => {
		expect(() => new EsotericDate(earth, 0).fromFormatted('00:00 Smarch 01, 0001')).toThrow()
	})
})
