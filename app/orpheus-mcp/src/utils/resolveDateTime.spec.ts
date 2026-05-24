import { describe, expect, it } from 'vitest'

import { mockNumericCalendar } from '../test-utils/mockCalendar.js'
import { resolveDateTime } from './resolveDateTime.js'

// The numeric test calendar parses a plain number back into a timestamp.
const worldData = { calendars: [mockNumericCalendar()] } as unknown as Parameters<typeof resolveDateTime>[1]

describe('resolveDateTime', () => {
	it('returns undefined when no dateTime is given', () => {
		expect(resolveDateTime(undefined, worldData)).toBeUndefined()
	})

	it('parses a valid dateTime string into a numeric timestamp', () => {
		expect(resolveDateTime('1440', worldData)).toBe(1440)
	})

	it('parses the origin (zero) dateTime', () => {
		expect(resolveDateTime('0', worldData)).toBe(0)
	})

	it('parses negative dateTimes', () => {
		expect(resolveDateTime('-5', worldData)).toBe(-5)
	})

	it('throws a helpful error when the dateTime cannot be parsed', () => {
		expect(() => resolveDateTime('not-a-real-date', worldData)).toThrow('Unable to parse dateTime')
	})

	it('includes the expected format and available units in the error', () => {
		try {
			resolveDateTime('not-a-real-date', worldData)
			expect.unreachable('resolveDateTime should have thrown')
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			expect(message).toContain('Expected format: d')
			expect(message).toContain('Available units:')
			expect(message).toContain('d: Day')
		}
	})
})
