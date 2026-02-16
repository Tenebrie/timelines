import { WorldCalendar } from '@api/types/worldTypes'
import { describe, expect, it } from 'vitest'

import {
	mockCalendar,
	mockCalendarUnit,
	mockCalendarUnitChildRelation,
	mockCalendarUnitParentRelation,
} from '@/api/mock/rheaModels.mock'
import { CalendarUnit } from '@/api/types/calendarTypes'

import { EsotericDate } from './EsotericDate'

function makeCalendar(units: CalendarUnit[]): WorldCalendar {
	return mockCalendar({ units })
}

describe('EsotericDate.floor', () => {
	describe('simple single-level calendar (Hour → Minute)', () => {
		const minute = mockCalendarUnit({
			id: 'minute',
			name: 'Minute',
			duration: 1,
			formatShorthand: 'i',
			parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
		})
		const hour = mockCalendarUnit({
			id: 'hour',
			name: 'Hour',
			duration: 60,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
		})
		const units: CalendarUnit[] = [hour, minute]
		const calendar = makeCalendar(units)

		it('floor to minute at exact minute boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 34)
			const result = date.floor(minute)
			// Minute has duration 1, so it's always at its own boundary
			expect(result.getTimestamp()).toBe(34)
		})

		it('floor to hour strips the minute offset', () => {
			// timestamp 94 = hour 1, minute 34
			const date = new EsotericDate(calendar, 94)
			const result = date.floor(hour)
			// floor to hour → hour 1, minute 0 = 60
			expect(result.getTimestamp()).toBe(60)
		})

		it('floor to hour at exact hour boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 120)
			const result = date.floor(hour)
			expect(result.getTimestamp()).toBe(120)
		})

		it('floor to hour at timestamp 0 → 0', () => {
			const date = new EsotericDate(calendar, 0)
			const result = date.floor(hour)
			expect(result.getTimestamp()).toBe(0)
		})

		it('floor to hour at minute 59 → start of that hour', () => {
			// timestamp 59 = hour 0, minute 59
			const date = new EsotericDate(calendar, 59)
			const result = date.floor(hour)
			expect(result.getTimestamp()).toBe(0)
		})
	})

	describe('three-level calendar (Day → Hour → Minute)', () => {
		const minute = mockCalendarUnit({
			id: 'minute',
			name: 'Minute',
			duration: 1,
			formatShorthand: 'i',
			parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
		})
		const hour = mockCalendarUnit({
			id: 'hour',
			name: 'Hour',
			duration: 60,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
		})
		const day = mockCalendarUnit({
			id: 'day',
			name: 'Day',
			duration: 1440,
			formatShorthand: 'd',
			children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
		})
		const units: CalendarUnit[] = [day, hour, minute]
		const calendar = makeCalendar(units)

		it('floor to hour strips only the minute offset', () => {
			// timestamp = day 1, hour 5, minute 30 = 1440 + 300 + 30 = 1770
			const date = new EsotericDate(calendar, 1770)
			const result = date.floor(hour)
			// → day 1, hour 5, minute 0 = 1440 + 300 = 1740
			expect(result.getTimestamp()).toBe(1740)
		})

		it('floor to day strips hour and minute', () => {
			// timestamp = day 1, hour 5, minute 30 = 1770
			const date = new EsotericDate(calendar, 1770)
			const result = date.floor(day)
			// → day 1, hour 0, minute 0 = 1440
			expect(result.getTimestamp()).toBe(1440)
		})

		it('floor to minute is a no-op (smallest unit, dur=1)', () => {
			const date = new EsotericDate(calendar, 1770)
			const result = date.floor(minute)
			expect(result.getTimestamp()).toBe(1770)
		})

		it('floor to hour at exact boundary → same timestamp', () => {
			// day 2, hour 10, minute 0 = 2*1440 + 10*60 = 3480
			const date = new EsotericDate(calendar, 3480)
			const result = date.floor(hour)
			expect(result.getTimestamp()).toBe(3480)
		})
	})

	describe('mixed children with different durations (Day → [NormalHour x20, LongHour x4])', () => {
		// NormalHour dur=60, LongHour dur=90
		// Day dur = 20*60 + 4*90 = 1200 + 360 = 1560
		const second = mockCalendarUnit({
			id: 'second',
			name: 'Second',
			duration: 1,
			formatShorthand: 's',
			parents: [
				mockCalendarUnitParentRelation('normal-hour', 'second', 60),
				mockCalendarUnitParentRelation('long-hour', 'second', 90),
			],
		})
		const normalHour = mockCalendarUnit({
			id: 'normal-hour',
			name: 'NormalHour',
			displayName: 'Hour',
			duration: 60,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('normal-hour', 'second', 60)],
			parents: [mockCalendarUnitParentRelation('day', 'normal-hour', 20)],
		})
		const longHour = mockCalendarUnit({
			id: 'long-hour',
			name: 'LongHour',
			displayName: 'Hour',
			duration: 90,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('long-hour', 'second', 90)],
			parents: [mockCalendarUnitParentRelation('day', 'long-hour', 4)],
		})
		const day = mockCalendarUnit({
			id: 'day',
			name: 'Day',
			duration: 1560,
			formatShorthand: 'd',
			children: [
				mockCalendarUnitChildRelation('day', 'normal-hour', 20, { position: 0 }),
				mockCalendarUnitChildRelation('day', 'long-hour', 4, { position: 1 }),
			],
		})
		const units: CalendarUnit[] = [day, normalHour, longHour, second]
		const calendar = makeCalendar(units)

		it('floor to hour in NormalHour range strips seconds', () => {
			// NormalHour 5, Second 30 = 5*60 + 30 = 330
			const date = new EsotericDate(calendar, 330)
			const result = date.floor(normalHour)
			// → NormalHour 5, Second 0 = 300
			expect(result.getTimestamp()).toBe(300)
		})

		it('floor to hour in LongHour range strips seconds', () => {
			// LongHour 1 (bucket Hour 21), Second 45
			// offset = 20*60 + 1*90 + 45 = 1200 + 90 + 45 = 1335
			const date = new EsotericDate(calendar, 1335)
			const result = date.floor(longHour)
			// → LongHour 1, Second 0 = 1200 + 90 = 1290
			expect(result.getTimestamp()).toBe(1290)
		})

		it('floor to day strips everything', () => {
			// Day 1, NormalHour 5, Second 30 = 1560 + 330 = 1890
			const date = new EsotericDate(calendar, 1890)
			const result = date.floor(day)
			expect(result.getTimestamp()).toBe(1560)
		})

		it('floor to hour at exact hour boundary → same timestamp', () => {
			// NormalHour 10, Second 0 = 600
			const date = new EsotericDate(calendar, 600)
			const result = date.floor(normalHour)
			expect(result.getTimestamp()).toBe(600)
		})
	})

	describe('hidden parent / year cycle (YearCycle[hidden] → [NormalYear x2, LeapYear x1])', () => {
		// NormalYear dur=100, LeapYear dur=110. YearCycle dur=310 (hidden)
		const month = mockCalendarUnit({
			id: 'month',
			name: 'Month',
			duration: 10,
			formatShorthand: 'M',
			parents: [
				mockCalendarUnitParentRelation('normal-year', 'month', 10),
				mockCalendarUnitParentRelation('leap-year', 'month', 11),
			],
		})
		const normalYear = mockCalendarUnit({
			id: 'normal-year',
			name: 'NormalYear',
			displayName: 'Year',
			duration: 100,
			formatShorthand: 'y',
			children: [mockCalendarUnitChildRelation('normal-year', 'month', 10)],
			parents: [mockCalendarUnitParentRelation('year-cycle', 'normal-year', 2)],
		})
		const leapYear = mockCalendarUnit({
			id: 'leap-year',
			name: 'LeapYear',
			displayName: 'Year',
			duration: 110,
			formatShorthand: 'y',
			children: [mockCalendarUnitChildRelation('leap-year', 'month', 11)],
			parents: [mockCalendarUnitParentRelation('year-cycle', 'leap-year', 1)],
		})
		const yearCycle = mockCalendarUnit({
			id: 'year-cycle',
			name: 'YearCycle',
			duration: 310,
			formatMode: 'Hidden',
			formatShorthand: '',
			children: [
				mockCalendarUnitChildRelation('year-cycle', 'normal-year', 2, { position: 0 }),
				mockCalendarUnitChildRelation('year-cycle', 'leap-year', 1, { position: 1 }),
			],
		})
		const units: CalendarUnit[] = [yearCycle, normalYear, leapYear, month]
		const calendar = makeCalendar(units)

		it('floor to year in NormalYear 0 strips the month offset', () => {
			// NormalYear 0, Month 5 = 50
			const date = new EsotericDate(calendar, 50)
			const result = date.floor(normalYear)
			// → NormalYear 0, Month 0 = 0
			expect(result.getTimestamp()).toBe(0)
		})

		it('floor to year in NormalYear 1 strips the month offset', () => {
			// NormalYear 1, Month 3 = 100 + 30 = 130
			const date = new EsotericDate(calendar, 130)
			const result = date.floor(normalYear)
			// → NormalYear 1, Month 0 = 100
			expect(result.getTimestamp()).toBe(100)
		})

		it('floor to year in LeapYear (year 2) strips the month offset', () => {
			// LeapYear 0 (bucket Year 2), Month 5 = 200 + 50 = 250
			const date = new EsotericDate(calendar, 250)
			const result = date.floor(leapYear)
			// → LeapYear start = 200
			expect(result.getTimestamp()).toBe(200)
		})

		it('floor to year in second cycle NormalYear 0 (bucket Year 3)', () => {
			// Cycle 1 starts at 310. NormalYear 0 in cycle 1, Month 7 = 310 + 70 = 380
			const date = new EsotericDate(calendar, 380)
			const result = date.floor(normalYear)
			// → Cycle 1 start + NormalYear 0 offset = 310
			expect(result.getTimestamp()).toBe(310)
		})

		it('floor to year at exact year boundary → same timestamp', () => {
			// LeapYear start = 200
			const date = new EsotericDate(calendar, 200)
			const result = date.floor(leapYear)
			expect(result.getTimestamp()).toBe(200)
		})
	})

	describe('negative timestamps', () => {
		const minute = mockCalendarUnit({
			id: 'minute',
			name: 'Minute',
			duration: 1,
			formatShorthand: 'i',
			parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
		})
		const hour = mockCalendarUnit({
			id: 'hour',
			name: 'Hour',
			duration: 60,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
		})
		const units: CalendarUnit[] = [hour, minute]
		const calendar = makeCalendar(units)

		it('floor to hour with negative timestamp', () => {
			// timestamp -25 → within hour -1 (which spans -60 to -1), minute 35
			// floor to hour → start of that hour = -60
			const date = new EsotericDate(calendar, -25)
			const result = date.floor(hour)
			expect(result.getTimestamp()).toBe(-60)
		})

		it('floor to root hour with negative timestamp', () => {
			// As root unit, floor(-25) to hour = Math.floor(-25/60)*60 = -1*60 = -60
			// But hour has a parent here... let me use a root-only test
			const rootHour = mockCalendarUnit({
				id: 'root-hour',
				name: 'Hour',
				duration: 60,
				formatShorthand: 'h',
				children: [mockCalendarUnitChildRelation('root-hour', 'minute', 60)],
			})
			const rootMinute = mockCalendarUnit({
				id: 'minute',
				name: 'Minute',
				duration: 1,
				formatShorthand: 'i',
				parents: [mockCalendarUnitParentRelation('root-hour', 'minute', 60)],
			})
			const rootCal = makeCalendar([rootHour, rootMinute])

			const date = new EsotericDate(rootCal, -25)
			const result = date.floor(rootHour)
			// Math.floor(-25/60)*60 = -1*60 = -60
			expect(result.getTimestamp()).toBe(-60)
		})
	})

	describe('format sanity checks (Day → Hour → Minute → Second)', () => {
		const second = mockCalendarUnit({
			id: 'second',
			name: 'Second',
			duration: 1,
			formatShorthand: 's',
			parents: [mockCalendarUnitParentRelation('minute', 'second', 60)],
		})
		const minute = mockCalendarUnit({
			id: 'minute',
			name: 'Minute',
			duration: 60,
			formatShorthand: 'i',
			children: [mockCalendarUnitChildRelation('minute', 'second', 60)],
			parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
		})
		const hour = mockCalendarUnit({
			id: 'hour',
			name: 'Hour',
			duration: 3600,
			formatShorthand: 'h',
			children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
			parents: [mockCalendarUnitParentRelation('day', 'hour', 24)],
		})
		const day = mockCalendarUnit({
			id: 'day',
			name: 'Day',
			duration: 86400,
			formatShorthand: 'd',
			children: [mockCalendarUnitChildRelation('day', 'hour', 24)],
		})
		const units: CalendarUnit[] = [day, hour, minute, second]
		const calendar = makeCalendar(units)
		const fmt = 'dd:hh:ii:ss'

		it('floor to minute strips seconds', () => {
			// Day 0, Hour 5, Minute 30, Second 45 = 5*3600 + 30*60 + 45 = 19845
			const date = new EsotericDate(calendar, 19845)
			expect(date.format(fmt)).toBe('00:05:30:45')

			const result = date.floor(minute)
			expect(result.format(fmt)).toBe('00:05:30:00')
			expect(result.getTimestamp()).toBe(19800)
		})

		it('floor to hour strips minutes and seconds', () => {
			const date = new EsotericDate(calendar, 19845)
			const result = date.floor(hour)
			expect(result.format(fmt)).toBe('00:05:00:00')
			expect(result.getTimestamp()).toBe(18000)
		})

		it('floor to day strips everything', () => {
			// Day 1, Hour 13, Minute 45, Second 22 = 86400 + 13*3600 + 45*60 + 22 = 135922
			const date = new EsotericDate(calendar, 135922)
			expect(date.format(fmt)).toBe('01:13:45:22')

			const result = date.floor(day)
			expect(result.format(fmt)).toBe('01:00:00:00')
			expect(result.getTimestamp()).toBe(86400)
		})

		it('floor at exact boundary changes nothing', () => {
			// Day 2, Hour 0, Minute 0, Second 0 = 172800
			const date = new EsotericDate(calendar, 172800)
			expect(date.format(fmt)).toBe('02:00:00:00')

			const result = date.floor(day)
			expect(result.format(fmt)).toBe('02:00:00:00')
			expect(result.getTimestamp()).toBe(172800)
		})

		it('floor to hour just before midnight', () => {
			// Day 0, Hour 23, Minute 59, Second 59 = 23*3600 + 59*60 + 59 = 86399
			const date = new EsotericDate(calendar, 86399)
			expect(date.format(fmt)).toBe('00:23:59:59')

			const result = date.floor(hour)
			expect(result.format(fmt)).toBe('00:23:00:00')
			expect(result.getTimestamp()).toBe(82800)
		})
	})

	describe('nested hidden cycles (Earth-like calendar)', () => {
		/**
		 * Simplified Earth calendar structure (same as step tests):
		 *   400-year cycle (hidden) → 100-year cycle x3, 4-year cycle x25
		 *   100-year cycle (hidden) → 4-year cycle x24, Regular year x4
		 *   4-year cycle  (hidden) → Regular year x3, Leap year x1
		 *   Regular year (displayName "Year") → Month x12 (each 30 days)
		 *   Leap year    (displayName "Year") → Month x13 (each 30 days)
		 *
		 * Durations:
		 *   Month         = 30
		 *   Regular year  = 360
		 *   Leap year     = 390
		 *   4-year cycle  = 1470
		 *   100-year cycle = 36720
		 *   400-year cycle = 146910
		 */

		const month = mockCalendarUnit({
			id: 'month',
			name: 'Month',
			displayName: 'month',
			duration: 30,
			formatShorthand: 'M',
			parents: [
				mockCalendarUnitParentRelation('regular-year', 'month', 12),
				mockCalendarUnitParentRelation('leap-year', 'month', 13),
			],
		})

		const regularYear = mockCalendarUnit({
			id: 'regular-year',
			name: 'RegularYear',
			displayName: 'year',
			duration: 360,
			formatShorthand: 'Y',
			formatMode: 'NumericOneIndexed',
			children: [mockCalendarUnitChildRelation('regular-year', 'month', 12)],
			parents: [
				mockCalendarUnitParentRelation('4-year-cycle', 'regular-year', 3),
				mockCalendarUnitParentRelation('100-year-cycle', 'regular-year', 4),
			],
		})

		const leapYear = mockCalendarUnit({
			id: 'leap-year',
			name: 'LeapYear',
			displayName: 'year',
			duration: 390,
			formatShorthand: 'Y',
			formatMode: 'NumericOneIndexed',
			children: [mockCalendarUnitChildRelation('leap-year', 'month', 13)],
			parents: [mockCalendarUnitParentRelation('4-year-cycle', 'leap-year', 1)],
		})

		const fourYearCycle = mockCalendarUnit({
			id: '4-year-cycle',
			name: '4YearCycle',
			displayName: '4YearCycle',
			duration: 1470,
			formatMode: 'Hidden',
			formatShorthand: '',
			children: [
				mockCalendarUnitChildRelation('4-year-cycle', 'regular-year', 3, { position: 0 }),
				mockCalendarUnitChildRelation('4-year-cycle', 'leap-year', 1, { position: 1 }),
			],
			parents: [
				mockCalendarUnitParentRelation('100-year-cycle', '4-year-cycle', 24),
				mockCalendarUnitParentRelation('400-year-cycle', '4-year-cycle', 25),
			],
		})

		const hundredYearCycle = mockCalendarUnit({
			id: '100-year-cycle',
			name: '100YearCycle',
			displayName: '100YearCycle',
			duration: 36720,
			formatMode: 'Hidden',
			formatShorthand: '',
			children: [
				mockCalendarUnitChildRelation('100-year-cycle', '4-year-cycle', 24, { position: 0 }),
				mockCalendarUnitChildRelation('100-year-cycle', 'regular-year', 4, { position: 1 }),
			],
			parents: [mockCalendarUnitParentRelation('400-year-cycle', '100-year-cycle', 3)],
		})

		const fourHundredYearCycle = mockCalendarUnit({
			id: '400-year-cycle',
			name: '400YearCycle',
			displayName: '400YearCycle',
			duration: 146910,
			formatMode: 'Hidden',
			formatShorthand: '',
			children: [
				mockCalendarUnitChildRelation('400-year-cycle', '100-year-cycle', 3, { position: 0 }),
				mockCalendarUnitChildRelation('400-year-cycle', '4-year-cycle', 25, { position: 1 }),
			],
		})

		const units: CalendarUnit[] = [
			fourHundredYearCycle,
			hundredYearCycle,
			fourYearCycle,
			regularYear,
			leapYear,
			month,
		]
		const calendar = makeCalendar(units)

		it('floor to year within first 4-year cycle', () => {
			// Year 1, month 5 = 360 + 5*30 = 510
			const date = new EsotericDate(calendar, 510)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(360)
		})

		it('floor to year for leap year', () => {
			// Year 3 (leap) starts at 1080, midway through = 1080 + 60 = 1140
			const date = new EsotericDate(calendar, 1140)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(1080)
		})

		it('floor to year in tail section of 100-year cycle (year 96)', () => {
			// Year 96 starts at 35280 (first regular year in tail), midway = 35280 + 15 = 35295
			const date = new EsotericDate(calendar, 35295)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(35280)
		})

		it('floor to year in tail section of 100-year cycle (year 99)', () => {
			// Year 99 starts at 36360, midway = 36360 + 100 = 36460
			const date = new EsotericDate(calendar, 36460)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(36360)
		})

		it('floor to year at exact 100-year boundary (year 100)', () => {
			// Year 100 starts at 36720
			const date = new EsotericDate(calendar, 36720)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(36720)
		})

		it('floor to year midway through year 100', () => {
			// Year 100 starts at 36720, midway = 36720 + 180 = 36900
			const date = new EsotericDate(calendar, 36900)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(36720)
		})

		it('floor to year at 400-year boundary (year 400)', () => {
			// Year 400 starts at 146910
			const date = new EsotericDate(calendar, 146910)
			const result = date.floor(regularYear)
			expect(result.getTimestamp()).toBe(146910)
		})

		it('floor then step produces correct sequential years across 100-year boundary', () => {
			// Start midway through year 98 (36000 + 180 = 36180)
			const date = new EsotericDate(calendar, 36180)
			const floored = date.floor(regularYear)
			expect(floored.getTimestamp()).toBe(36000) // year 98 start

			const year99 = floored.step(regularYear, 1)
			expect(year99.getTimestamp()).toBe(36360) // year 99

			const year100 = year99.step(regularYear, 1)
			expect(year100.getTimestamp()).toBe(36720) // year 100

			const year101 = year100.step(regularYear, 1)
			expect(year101.getTimestamp()).toBe(37080) // year 101
		})
	})
})
