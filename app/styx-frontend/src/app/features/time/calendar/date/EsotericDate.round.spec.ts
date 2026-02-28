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

describe('EsotericDate.round', () => {
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

		it('round to minute at exact boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 34)
			const result = date.round(minute)
			expect(result.getTimestamp()).toBe(34)
		})

		it('round to hour at exact boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 120)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(120)
		})

		it('round to hour rounds down when closer to start', () => {
			// timestamp 70 = hour 1, minute 10 → closer to hour 1 (60)
			const date = new EsotericDate(calendar, 70)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(60)
		})

		it('round to hour rounds up when closer to next', () => {
			// timestamp 50 = hour 0, minute 50 → closer to hour 1 (60)
			const date = new EsotericDate(calendar, 50)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(60)
		})

		it('round to hour at exact midpoint rounds down (tie-break)', () => {
			// timestamp 30 = hour 0, minute 30 → equidistant → rounds down
			const date = new EsotericDate(calendar, 30)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to hour just past midpoint rounds up', () => {
			// timestamp 31 = hour 0, minute 31 → closer to hour 1
			const date = new EsotericDate(calendar, 31)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(60)
		})

		it('round to hour at timestamp 0 → 0', () => {
			const date = new EsotericDate(calendar, 0)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to hour at minute 59 → next hour', () => {
			// timestamp 59 = hour 0, minute 59 → closer to hour 1 (60)
			const date = new EsotericDate(calendar, 59)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(60)
		})

		it('round to hour at minute 1 → same hour', () => {
			// timestamp 61 = hour 1, minute 1 → closer to hour 1 (60)
			const date = new EsotericDate(calendar, 61)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(60)
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

		it('round to hour rounds down when closer to start', () => {
			// day 1, hour 5, minute 10 = 1440 + 300 + 10 = 1750
			const date = new EsotericDate(calendar, 1750)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(1740) // day 1, hour 5
		})

		it('round to hour rounds up when closer to next', () => {
			// day 1, hour 5, minute 50 = 1440 + 300 + 50 = 1790
			const date = new EsotericDate(calendar, 1790)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(1800) // day 1, hour 6
		})

		it('round to day rounds down when closer to start', () => {
			// day 1, hour 5, minute 30 = 1440 + 330 = 1770 (closer to day 1 at 1440)
			const date = new EsotericDate(calendar, 1770)
			const result = date.round(day)
			expect(result.getTimestamp()).toBe(1440)
		})

		it('round to day rounds up when closer to next', () => {
			// day 0, hour 20, minute 0 = 1200 (closer to day 1 at 1440 than day 0 at 0)
			const date = new EsotericDate(calendar, 1200)
			const result = date.round(day)
			expect(result.getTimestamp()).toBe(1440)
		})

		it('round to day at exact midpoint rounds down', () => {
			// day 0, hour 12, minute 0 = 720 → equidistant → rounds down
			const date = new EsotericDate(calendar, 720)
			const result = date.round(day)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to minute is a no-op (smallest unit, dur=1)', () => {
			const date = new EsotericDate(calendar, 1770)
			const result = date.round(minute)
			expect(result.getTimestamp()).toBe(1770)
		})

		it('round to hour at exact boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 3480)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(3480)
		})

		it('round to hour at last minute rounds up to next hour', () => {
			// hour 23, minute 59 = 23*60 + 59 = 1439
			const date = new EsotericDate(calendar, 1439)
			const result = date.round(hour)
			// closer to 1440 (next hour) than 1380 (hour 23)
			expect(result.getTimestamp()).toBe(1440)
		})
	})

	describe('mixed children with different durations (Day → [NormalHour x20, LongHour x4])', () => {
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

		it('round to hour in NormalHour range rounds down', () => {
			// NormalHour 5, Second 10 = 5*60 + 10 = 310
			const date = new EsotericDate(calendar, 310)
			const result = date.round(normalHour)
			expect(result.getTimestamp()).toBe(300) // NormalHour 5
		})

		it('round to hour in NormalHour range rounds up', () => {
			// NormalHour 5, Second 50 = 5*60 + 50 = 350
			const date = new EsotericDate(calendar, 350)
			const result = date.round(normalHour)
			expect(result.getTimestamp()).toBe(360) // NormalHour 6
		})

		it('round to hour in LongHour range rounds down', () => {
			// LongHour 1, Second 10 = 20*60 + 1*90 + 10 = 1200 + 90 + 10 = 1300
			const date = new EsotericDate(calendar, 1300)
			const result = date.round(longHour)
			expect(result.getTimestamp()).toBe(1290) // LongHour 1
		})

		it('round to hour in LongHour range rounds up', () => {
			// LongHour 1, Second 80 = 1200 + 90 + 80 = 1370
			const date = new EsotericDate(calendar, 1370)
			const result = date.round(longHour)
			expect(result.getTimestamp()).toBe(1380) // LongHour 2
		})

		it('round to day rounds down when closer to start', () => {
			// Day 1, Second 100 = 1560 + 100 = 1660
			const date = new EsotericDate(calendar, 1660)
			const result = date.round(day)
			expect(result.getTimestamp()).toBe(1560)
		})

		it('round to day rounds up when closer to next', () => {
			// Day 0, offset 1400 → closer to day 1 at 1560
			const date = new EsotericDate(calendar, 1400)
			const result = date.round(day)
			expect(result.getTimestamp()).toBe(1560)
		})

		it('round to hour at exact boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 600)
			const result = date.round(normalHour)
			expect(result.getTimestamp()).toBe(600)
		})
	})

	describe('hidden parent / year cycle (YearCycle[hidden] → [NormalYear x2, LeapYear x1])', () => {
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

		it('round to year rounds down when closer to start', () => {
			// NormalYear 0, Month 3 = 30
			const date = new EsotericDate(calendar, 30)
			const result = date.round(normalYear)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to year rounds up when closer to next', () => {
			// NormalYear 0, Month 8 = 80 → closer to year 1 at 100
			const date = new EsotericDate(calendar, 80)
			const result = date.round(normalYear)
			expect(result.getTimestamp()).toBe(100)
		})

		it('round to year at exact midpoint of NormalYear (dur=100) rounds down', () => {
			// NormalYear 0, Month 5 = 50 → equidistant → rounds down
			const date = new EsotericDate(calendar, 50)
			const result = date.round(normalYear)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to year just past midpoint of NormalYear rounds up', () => {
			// NormalYear 0, offset 51 → closer to next year at 100
			const date = new EsotericDate(calendar, 51)
			const result = date.round(normalYear)
			expect(result.getTimestamp()).toBe(100)
		})

		it('round to year in LeapYear rounds down when closer to start', () => {
			// LeapYear starts at 200, Month 3 = 200 + 30 = 230
			const date = new EsotericDate(calendar, 230)
			const result = date.round(leapYear)
			expect(result.getTimestamp()).toBe(200)
		})

		it('round to year in LeapYear rounds up when closer to next', () => {
			// LeapYear starts at 200, dur=110, Month 9 = 200 + 90 = 290
			// Next year at 310
			const date = new EsotericDate(calendar, 290)
			const result = date.round(leapYear)
			expect(result.getTimestamp()).toBe(310)
		})

		it('round to year at exact year boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, 200)
			const result = date.round(leapYear)
			expect(result.getTimestamp()).toBe(200)
		})

		it('round to year in second cycle rounds correctly', () => {
			// Cycle 1 starts at 310. NormalYear 0 in cycle 1, Month 8 = 310 + 80 = 390
			// Next year starts at 410
			const date = new EsotericDate(calendar, 390)
			const result = date.round(normalYear)
			expect(result.getTimestamp()).toBe(410)
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

		it('round to hour with negative timestamp closer to floor', () => {
			// timestamp -50 → within hour [-60, -1], offset 10 into the hour
			// floor = -60, ceil = 0, dist to floor = 10, dist to ceil = 50 → rounds down
			const date = new EsotericDate(calendar, -50)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(-60)
		})

		it('round to hour with negative timestamp closer to ceil', () => {
			// timestamp -10 → within hour [-60, -1], offset 50 into the hour
			// floor = -60, ceil = 0, dist to floor = 50, dist to ceil = 10 → rounds up
			const date = new EsotericDate(calendar, -10)
			const result = date.round(hour)
			expect(result.getTimestamp()).toBe(0)
		})

		it('round to hour at negative exact boundary → same timestamp', () => {
			const date = new EsotericDate(calendar, -60)
			const result = date.round(hour)
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

		it('round to minute rounds down when second < 30', () => {
			// Day 0, Hour 5, Minute 30, Second 20 = 5*3600 + 30*60 + 20 = 19820
			const date = new EsotericDate(calendar, 19820)
			expect(date.format(fmt)).toBe('00:05:30:20')

			const result = date.round(minute)
			expect(result.format(fmt)).toBe('00:05:30:00')
			expect(result.getTimestamp()).toBe(19800)
		})

		it('round to minute rounds up when second > 30', () => {
			// Day 0, Hour 5, Minute 30, Second 45 = 5*3600 + 30*60 + 45 = 19845
			const date = new EsotericDate(calendar, 19845)
			expect(date.format(fmt)).toBe('00:05:30:45')

			const result = date.round(minute)
			expect(result.format(fmt)).toBe('00:05:31:00')
			expect(result.getTimestamp()).toBe(19860)
		})

		it('round to hour rounds down when closer to start', () => {
			// Day 0, Hour 5, Minute 10, Second 0 = 5*3600 + 600 = 18600
			const date = new EsotericDate(calendar, 18600)
			expect(date.format(fmt)).toBe('00:05:10:00')

			const result = date.round(hour)
			expect(result.format(fmt)).toBe('00:05:00:00')
			expect(result.getTimestamp()).toBe(18000)
		})

		it('round to hour rounds up when closer to next', () => {
			// Day 0, Hour 5, Minute 50, Second 0 = 5*3600 + 3000 = 21000
			const date = new EsotericDate(calendar, 21000)
			expect(date.format(fmt)).toBe('00:05:50:00')

			const result = date.round(hour)
			expect(result.format(fmt)).toBe('00:06:00:00')
			expect(result.getTimestamp()).toBe(21600)
		})

		it('round to day rounds down when closer to start', () => {
			// Day 1, Hour 5, Minute 0, Second 0 = 86400 + 18000 = 104400
			const date = new EsotericDate(calendar, 104400)
			expect(date.format(fmt)).toBe('01:05:00:00')

			const result = date.round(day)
			expect(result.format(fmt)).toBe('01:00:00:00')
			expect(result.getTimestamp()).toBe(86400)
		})

		it('round to day rounds up when closer to next', () => {
			// Day 1, Hour 20, Minute 0, Second 0 = 86400 + 72000 = 158400
			const date = new EsotericDate(calendar, 158400)
			expect(date.format(fmt)).toBe('01:20:00:00')

			const result = date.round(day)
			expect(result.format(fmt)).toBe('02:00:00:00')
			expect(result.getTimestamp()).toBe(172800)
		})

		it('round at exact boundary changes nothing', () => {
			const date = new EsotericDate(calendar, 172800)
			expect(date.format(fmt)).toBe('02:00:00:00')

			const result = date.round(day)
			expect(result.format(fmt)).toBe('02:00:00:00')
			expect(result.getTimestamp()).toBe(172800)
		})
	})
})
