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

const minute = mockCalendarUnit({
	id: 'minute',
	name: 'Minute',
	duration: 1,
	formatShorthand: 'm',
	formatMode: 'Numeric',
	parents: [mockCalendarUnitParentRelation('hour', 'minute', 60)],
})
const hour = mockCalendarUnit({
	id: 'hour',
	name: 'Hour',
	duration: 60,
	formatShorthand: 'h',
	formatMode: 'Numeric',
	children: [mockCalendarUnitChildRelation('hour', 'minute', 60)],
})
const units: CalendarUnit[] = [hour, minute]

describe('EsotericDate originTime coercion', () => {
	it('adds the timestamp to a string originTime numerically', () => {
		const calendar: WorldCalendar = mockCalendar({
			units,
			originTime: '120' as unknown as number,
			dateFormat: 'h:m',
		})

		expect(new EsotericDate(calendar, 0).format()).toBe('2:0')
		expect(new EsotericDate(calendar, 1).format()).toBe('2:1')
		expect(new EsotericDate(calendar, 2).format()).toBe('2:2')
	})

	it('coerces a string timestamp argument as well', () => {
		const calendar: WorldCalendar = mockCalendar({ units, originTime: 120, dateFormat: 'h:m' })

		expect(new EsotericDate(calendar, '61' as unknown as number).format()).toBe('3:1')
	})
})
