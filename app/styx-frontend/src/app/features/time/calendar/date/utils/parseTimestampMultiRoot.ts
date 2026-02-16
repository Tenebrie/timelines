import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { ParsedTimestamp } from '../types'
import { parseTimestampSingleRoot } from './parseTimestampSingleRoot'

export function parseTimestampMultiRoot({
	allUnits,
	timestamp,
}: {
	allUnits: CalendarDraftUnit[] | CalendarUnit[]
	timestamp: number
}) {
	const roots = allUnits
		.filter((u) => u.parents.length === 0)
		.map((rootUnit) => {
			const parsed = parseTimestampSingleRoot({
				allUnits,
				unit: rootUnit,
				timestamp,
				extraDuration: 0,
			})
			return {
				unit: rootUnit,
				parsed,
			}
		})
		.sort((a, b) => a.unit.position - b.unit.position)

	const seenKeys = new Set<string>()
	const combinedTimeMap: ParsedTimestamp = new Map()
	for (const root of roots) {
		for (const [key, value] of root.parsed.entries()) {
			if (!combinedTimeMap.has(key) && value.formatShorthand && !seenKeys.has(value.formatShorthand)) {
				combinedTimeMap.set(key, value)
				seenKeys.add(value.formatShorthand)
			}
		}
	}
	return combinedTimeMap
}
