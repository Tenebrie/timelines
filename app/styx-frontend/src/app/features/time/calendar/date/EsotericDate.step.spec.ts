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

describe('EsotericDate.step — nested hidden cycles (Earth-like calendar)', () => {
	/**
	 * Simplified Earth calendar structure:
	 *   400-year cycle (hidden) → 100-year cycle x3, 4-year cycle x25
	 *   100-year cycle (hidden) → 4-year cycle x24, Regular year x4
	 *   4-year cycle  (hidden) → Regular year x3, Leap year x1
	 *   Regular year (displayName "Year") → Month x12 (each 30 days for simplicity)
	 *   Leap year    (displayName "Year") → Month x13 (each 30 days, extra month = leap)
	 *
	 * Durations:
	 *   Month         = 30
	 *   Regular year  = 12 * 30 = 360
	 *   Leap year     = 13 * 30 = 390
	 *   4-year cycle  = 3 * 360 + 390 = 1470
	 *   100-year cycle = 24 * 1470 + 4 * 360 = 35280 + 1440 = 36720
	 *   400-year cycle = 3 * 36720 + 25 * 1470 = 110160 + 36750 = 146910
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
		duration: 1470, // 3*360 + 390
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
		duration: 36720, // 24*1470 + 4*360
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
		duration: 146910, // 3*36720 + 25*1470
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

	// Precomputed year start timestamps for the first 12 years:
	// 4-year cycle pattern: Regular(360), Regular(360), Regular(360), Leap(390) = 1470
	// Year 0: Regular, starts at 0
	// Year 1: Regular, starts at 360
	// Year 2: Regular, starts at 720
	// Year 3: Leap,    starts at 1080
	// Year 4: Regular, starts at 1470 (new 4-year cycle)
	// Year 5: Regular, starts at 1830
	// Year 6: Regular, starts at 2190
	// Year 7: Leap,    starts at 2550
	// Year 8: Regular, starts at 2940 (new 4-year cycle)
	// Year 9: Regular, starts at 3300
	// Year 10: Regular, starts at 3660
	// Year 11: Leap,    starts at 4020
	const yearStarts = [0, 360, 720, 1080, 1470, 1830, 2190, 2550, 2940, 3300, 3660, 4020]

	describe('stepping year by year from timestamp 0 (simulating timeline anchors)', () => {
		it('step through first 12 years sequentially, each landing at the correct start', () => {
			let date = new EsotericDate(calendar, 0).floor(regularYear)

			for (let i = 0; i < 12; i++) {
				expect(date.getTimestamp(), `Year ${i} should start at ${yearStarts[i]}`).toBe(yearStarts[i])
				date = date.step(regularYear, 1)
			}
		})
	})

	describe('floor then step reproduces timeline anchor behavior', () => {
		it('floor to year then step +1 lands at next year start', () => {
			// Start mid-year 0 (month 5 = timestamp 150)
			const date = new EsotericDate(calendar, 150)
			const floored = date.floor(regularYear)
			expect(floored.getTimestamp()).toBe(0)

			const next = floored.step(regularYear, 1)
			expect(next.getTimestamp()).toBe(360) // Year 1 start
		})

		it('floor to year then step +1 across 4-year cycle boundary', () => {
			// Start in Year 3 (Leap year), month 2 = 1080 + 60 = 1140
			const date = new EsotericDate(calendar, 1140)
			const floored = date.floor(regularYear)
			expect(floored.getTimestamp()).toBe(1080) // Year 3 (Leap) start

			const next = floored.step(regularYear, 1)
			expect(next.getTimestamp()).toBe(1470) // Year 4 start (next 4-year cycle)
		})

		it('step +4 from year 0 lands at year 4 (crossing one full 4-year cycle)', () => {
			const date = new EsotericDate(calendar, 0)
			const result = date.step(regularYear, 4)
			expect(result.getTimestamp()).toBe(1470)
		})

		it('step +8 from year 0 lands at year 8 (crossing two 4-year cycles)', () => {
			const date = new EsotericDate(calendar, 0)
			const result = date.step(regularYear, 8)
			expect(result.getTimestamp()).toBe(2940)
		})
	})

	describe('crossing 100-year cycle boundary', () => {
		// 100-year cycle = 24 * 1470 + 4 * 360 = 36720
		// Years 0-95 are in 4-year cycles (24 cycles × 4 years)
		// Years 96-99 are Regular years (the tail of the 100-year cycle)
		//
		// Year 95 is the last year of the 24th 4-year cycle:
		//   = 23 full 4-year cycles + 3 years into 24th cycle
		//   = 23 * 1470 + 2 * 360 + 360 (wait, slot 3 is Leap)
		//   Actually: year 95 = cycle 23 (0-indexed), slot 3 (Leap year)
		//   = 23 * 1470 + 3 * 360 = 33810 + 1080 = 34890
		//   But slot 3 is Leap year (not Regular), so:
		//   year 92 = cycle 23, slot 0 (Regular) = 23 * 1470 = 33810
		//   year 93 = cycle 23, slot 1 (Regular) = 33810 + 360 = 34170
		//   year 94 = cycle 23, slot 2 (Regular) = 34170 + 360 = 34530
		//   year 95 = cycle 23, slot 3 (Leap)    = 34530 + 360 = 34890 (nope)
		// Wait: slots in 4-year-cycle are [Reg, Reg, Reg, Leap]
		// year 92 = 23*1470 = 33810
		// year 93 = 33810 + 360 = 34170
		// year 94 = 34170 + 360 = 34530
		// year 95 = 34530 + 360 = 34890 (this is the Leap year slot, duration 390)
		// year 96 = 34890 + 390 = 35280 = 24*1470 (start of Regular year x4 tail)
		// year 97 = 35280 + 360 = 35640
		// year 98 = 35640 + 360 = 36000
		// year 99 = 36000 + 360 = 36360
		// year 100 = 36720 (start of next 100-year cycle)

		it('step from year 95 (Leap) to year 96 (Regular, in tail section)', () => {
			const date = new EsotericDate(calendar, 34890)
			const result = date.step(regularYear, 1)
			expect(result.getTimestamp()).toBe(35280)
		})

		it('step from year 96 to year 97 (both in tail section)', () => {
			const date = new EsotericDate(calendar, 35280)
			const result = date.step(regularYear, 1)
			expect(result.getTimestamp()).toBe(35640)
		})

		it('step from year 99 to year 100 (crossing 100-year cycle boundary)', () => {
			const date = new EsotericDate(calendar, 36360)
			const result = date.step(regularYear, 1)
			expect(result.getTimestamp()).toBe(36720)
		})

		it('step sequentially through years 94-101 all land correctly', () => {
			const expectedStarts = [
				34530, // year 94 (Regular, cycle 23 slot 2)
				34890, // year 95 (Leap, cycle 23 slot 3)
				35280, // year 96 (Regular, tail slot 0)
				35640, // year 97 (Regular, tail slot 1)
				36000, // year 98 (Regular, tail slot 2)
				36360, // year 99 (Regular, tail slot 3)
				36720, // year 100 (Regular, 2nd 100-year-cycle, cycle 0 slot 0)
				37080, // year 101 (Regular, 2nd 100-year-cycle, cycle 0 slot 1)
			]

			let date = new EsotericDate(calendar, expectedStarts[0])
			for (let i = 0; i < expectedStarts.length; i++) {
				expect(date.getTimestamp(), `Year ${94 + i} should start at ${expectedStarts[i]}`).toBe(
					expectedStarts[i],
				)
				if (i < expectedStarts.length - 1) {
					date = date.step(regularYear, 1)
				}
			}
		})
	})

	describe('crossing 400-year cycle boundary', () => {
		// 400-year cycle duration = 146910
		// Last year of 400-year cycle:
		// The 400-year cycle = 100-year cycle x3, 4-year cycle x25
		// After 3 * 100-year cycles = 3 * 36720 = 110160
		// Then 25 4-year cycles: years 300-399
		// Year 399 = last year in last 4-year cycle = 110160 + 24*1470 + 1080 = 110160 + 35280 + 1080 = 146520
		// It's a Leap year (slot 3 of 4-year cycle), duration 390
		// Year 400 = 146520 + 390 = 146910 (start of next 400-year cycle)

		it('step from year 399 to year 400 (crossing 400-year cycle boundary)', () => {
			const date = new EsotericDate(calendar, 146520)
			const result = date.step(regularYear, 1)
			expect(result.getTimestamp()).toBe(146910)
		})
	})

	describe('timeline-like sequential stepping from arbitrary position', () => {
		it('floor then step 10 times produces monotonically increasing timestamps with correct gaps', () => {
			// Start at timestamp 500 (somewhere in year 1)
			const base = new EsotericDate(calendar, 500).floor(regularYear)
			expect(base.getTimestamp()).toBe(360) // Year 1 start

			const timestamps: number[] = [base.getTimestamp()]
			let date = base
			for (let i = 0; i < 10; i++) {
				date = date.step(regularYear, 1)
				timestamps.push(date.getTimestamp())
			}

			// Verify monotonically increasing
			for (let i = 1; i < timestamps.length; i++) {
				expect(timestamps[i], `timestamp[${i}] should be > timestamp[${i - 1}]`).toBeGreaterThan(
					timestamps[i - 1],
				)
			}

			// Verify each gap is either 360 (regular) or 390 (leap)
			for (let i = 1; i < timestamps.length; i++) {
				const gap = timestamps[i] - timestamps[i - 1]
				expect(
					gap === 360 || gap === 390,
					`Gap between year ${i} and ${i - 1} should be 360 or 390, got ${gap}`,
				).toBe(true)
			}

			// Verify specific expected timestamps
			// From year 1: [360, 720, 1080, 1470, 1830, 2190, 2550, 2940, 3300, 3660, 4020]
			const expected = [360, 720, 1080, 1470, 1830, 2190, 2550, 2940, 3300, 3660, 4020]
			expect(timestamps).toEqual(expected)
		})
	})
})

describe('EsotericDate.step — with originTime (simulating Earth 2023)', () => {
	/**
	 * Same simplified Earth calendar as above, but with a non-zero originTime.
	 * originTime = 8430 places raw timestamp 0 at year 23 of the 400-year cycle,
	 * which is at the START of a Leap year (slot 3 of 4-year cycle #5).
	 *
	 * This simulates what the real Earth 2023 calendar does: the user sees
	 * timestamp=0 as "year 2023", but the cycle hierarchy is relative to epoch year 0.
	 *
	 * Without accounting for originTime in step/floor, the code treats raw timestamp 0
	 * as the start of the root cycle, which produces wrong parent/slot resolution.
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

	// originTime = 8430: places raw timestamp 0 at 23 years into the 400-year cycle.
	// Year 23 = 4-year cycle #5, slot 3 (Leap year).
	// Absolute position 8430: 5 * 1470 = 7350, + 3 * 360 = 1080, total = 8430 ✓
	const originTime = 8430
	const calendar = makeCalendar(units)
	const calendarWithOrigin: WorldCalendar = { ...calendar, originTime }

	// Expected raw timestamps when stepping year by year from raw 0:
	// Raw 0 = absolute 8430 = Leap year start (cycle #5, slot 3), duration 390
	// Raw 390 = absolute 8820 = cycle #6, slot 0 (Regular), duration 360
	// Raw 750 = absolute 9180 = cycle #6, slot 1 (Regular), duration 360
	// Raw 1110 = absolute 9540 = cycle #6, slot 2 (Regular), duration 360
	// Raw 1470 = absolute 9900 = cycle #6, slot 3 (Leap), duration 390
	// Raw 1860 = absolute 10290 = cycle #7, slot 0 (Regular), duration 360
	// Raw 2220 = absolute 10650 = cycle #7, slot 1 (Regular), duration 360
	// Raw 2580 = absolute 11010 = cycle #7, slot 2 (Regular), duration 360
	// Raw 2940 = absolute 11370 = cycle #7, slot 3 (Leap), duration 390
	// Raw 3330 = absolute 11760 = cycle #8, slot 0 (Regular), duration 360
	const expectedStarts = [0, 390, 750, 1110, 1470, 1860, 2220, 2580, 2940, 3330]

	it('floor at raw 0 returns 0 (already at start of Leap year)', () => {
		const date = new EsotericDate(calendarWithOrigin, 0)
		const floored = date.floor(regularYear)
		expect(floored.getTimestamp()).toBe(0)
	})

	it('floor mid-year at raw 100 returns 0', () => {
		const date = new EsotericDate(calendarWithOrigin, 100)
		const floored = date.floor(regularYear)
		expect(floored.getTimestamp()).toBe(0)
	})

	it('step from raw 0 by +1 lands at raw 390 (next Regular year)', () => {
		const date = new EsotericDate(calendarWithOrigin, 0)
		const result = date.step(regularYear, 1)
		expect(result.getTimestamp()).toBe(390)
	})

	it('step through 10 years sequentially, each landing at the correct start', () => {
		let date = new EsotericDate(calendarWithOrigin, 0).floor(regularYear)

		for (let i = 0; i < expectedStarts.length; i++) {
			expect(date.getTimestamp(), `Year ${i} should start at ${expectedStarts[i]}`).toBe(expectedStarts[i])
			if (i < expectedStarts.length - 1) {
				date = date.step(regularYear, 1)
			}
		}
	})

	it('all gaps between years are either 360 (regular) or 390 (leap)', () => {
		let date = new EsotericDate(calendarWithOrigin, 0).floor(regularYear)
		const timestamps: number[] = [date.getTimestamp()]

		for (let i = 0; i < 9; i++) {
			date = date.step(regularYear, 1)
			timestamps.push(date.getTimestamp())
		}

		for (let i = 1; i < timestamps.length; i++) {
			const gap = timestamps[i] - timestamps[i - 1]
			expect(
				gap === 360 || gap === 390,
				`Gap between year ${i} and ${i - 1} should be 360 or 390, got ${gap}`,
			).toBe(true)
		}
	})

	it('floor mid-year then step reproduces timeline anchor behavior', () => {
		// Start mid-year at raw 200 (within the Leap year that starts at raw 0)
		const base = new EsotericDate(calendarWithOrigin, 200).floor(regularYear)
		expect(base.getTimestamp()).toBe(0)

		const next = base.step(regularYear, 1)
		expect(next.getTimestamp()).toBe(390)

		const nextNext = next.step(regularYear, 1)
		expect(nextNext.getTimestamp()).toBe(750)
	})

	it('step +4 from raw 0 crosses 4-year cycle boundary correctly', () => {
		// From raw 0 (Leap year), step +4 should land at raw 1470 (next Leap year)
		const date = new EsotericDate(calendarWithOrigin, 0)
		const result = date.step(regularYear, 4)
		expect(result.getTimestamp()).toBe(1470)
	})
})
