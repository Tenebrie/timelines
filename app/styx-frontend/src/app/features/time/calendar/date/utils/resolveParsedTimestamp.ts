import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { InputParsedTimestamp, InputParsedTimestampEntry } from '../types'
import { getOffsetInCycle } from './getOffsetInCycle'

export function resolveParsedTimestamp({
	allUnits,
	parsedTimestamp,
}: {
	allUnits: CalendarUnit[] | CalendarDraftUnit[]
	parsedTimestamp: InputParsedTimestamp
}) {
	// Build list of units to consider
	const entries: Array<{ unit: CalendarDraftUnit | CalendarUnit; entry: InputParsedTimestampEntry }> = []

	for (const [unitId, entry] of parsedTimestamp.entries()) {
		const unit = allUnits.find((u) => u.id === unitId)
		if (!unit) {
			continue
		}

		// Skip hidden units that have visible children in the parsed map
		// (their children absorbed their time contributions)
		if (unit.formatMode === 'Hidden') {
			const hasVisibleChildInMap = unit.children.some((childRelation) => {
				const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
				return childUnit && childUnit.formatMode !== 'Hidden' && parsedTimestamp.has(childUnit.id)
			})
			if (hasVisibleChildInMap) {
				continue
			}
		}

		entries.push({ unit, entry })
	}

	if (entries.length === 0) {
		return 0
	}

	// Check if units form a hierarchy (any two units have direct parent-child relationship)
	const formHierarchy = entries.some((a, i) =>
		entries.slice(i + 1).some((b) => {
			const aIsParentOfB = a.unit.children.some((c) => c.childUnitId === b.unit.id)
			const bIsParentOfA = b.unit.children.some((c) => c.childUnitId === a.unit.id)
			return aIsParentOfB || bIsParentOfA
		}),
	)

	if (formHierarchy) {
		// Sum all contributions from the hierarchy, accounting for hidden parent cycles
		return entries.reduce((sum, { unit, entry }) => {
			return sum + getOffsetInCycle(allUnits, unit, entry.value)
		}, 0)
	} else {
		// Use smallest duration unit from separate roots
		const smallest = entries.reduce((min, current) =>
			current.unit.duration < min.unit.duration ? current : min,
		)
		return smallest.entry.value * Number(smallest.unit.duration)
	}
}
