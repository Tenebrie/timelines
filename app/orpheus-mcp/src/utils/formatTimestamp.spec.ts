import { describe, expect, it } from 'vitest'

import { mockNumericCalendar } from '../test-utils/mockCalendar.js'
import { formatTimestamp } from './formatTimestamp.js'

// The numeric test calendar formats a timestamp as its plain number.
const worldData = { calendars: [mockNumericCalendar()] } as unknown as Parameters<typeof formatTimestamp>[1]

describe('formatTimestamp', () => {
	it('formats a numeric timestamp using the world calendar', () => {
		expect(formatTimestamp(1440, worldData)).toBe('1440')
	})

	it('accepts a string timestamp', () => {
		expect(formatTimestamp('1440', worldData)).toBe('1440')
	})

	it('formats the origin (zero) timestamp', () => {
		expect(formatTimestamp(0, worldData)).toBe('0')
	})

	it('formats negative timestamps', () => {
		expect(formatTimestamp(-5, worldData)).toBe('-5')
	})
})
