import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

import { ParsedTimestamp } from '../types'
import { sumNonHiddenChildren } from './sumNonHiddenChildren'

export function parseTimestampSingleRoot({
	outputMap,
	skippedChildCount,
	allUnits,
	unit,
	customLabel,
	timestamp,
	extraDuration,
	depth,
}: {
	outputMap?: ParsedTimestamp
	skippedChildCount?: Map<string, number>
	allUnits: CalendarDraftUnit[] | CalendarUnit[]
	unit: CalendarDraftUnit | CalendarUnit
	customLabel?: string
	timestamp: number
	// Non-consumed duration from hidden ancestors and siblings
	extraDuration: number
	depth: number
}) {
	outputMap = outputMap ?? new Map()
	skippedChildCount = skippedChildCount ?? new Map<string, number>()

	const index = Math.floor(timestamp / Number(unit.duration))
	let remainder = timestamp % Number(unit.duration)

	// Handle negative timestamps
	if (remainder < 0) {
		remainder += Number(unit.duration)
	}

	const unitKey = unit.displayName ?? unit.name
	const franDuration = skippedChildCount.get(unitKey) ?? 0
	outputMap.set(unit.id, {
		unit,
		value: index + (unit.formatMode === 'Hidden' ? 0 : extraDuration + franDuration),
		formatShorthand: unit.formatShorthand ?? undefined,
		customLabel,
	})

	if (unit.children.length === 0) {
		return outputMap
	}

	let myExtraDuration = 0
	if (unit.formatMode === 'Hidden') {
		myExtraDuration += sumNonHiddenChildren(allUnits, unit) * index
		myExtraDuration += extraDuration
	}

	for (let i = 0; i < unit.children.length; i++) {
		const childRelation = unit.children[i]
		const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
		if (!childUnit) {
			continue
		}
		if (remainder < Number(childUnit.duration) * childRelation.repeats) {
			return parseTimestampSingleRoot({
				outputMap,
				skippedChildCount,
				allUnits,
				unit: childUnit,
				timestamp: remainder,
				extraDuration: myExtraDuration,
				customLabel: childRelation.label ?? undefined,
				depth: depth + 1,
			})
		}
		remainder -= Number(childUnit.duration) * childRelation.repeats
		if (childUnit.formatMode === 'Hidden') {
			myExtraDuration += childRelation.repeats * sumNonHiddenChildren(allUnits, childUnit)
		} else {
			const childUnitKey = childUnit.displayName ?? childUnit.name
			skippedChildCount.set(childUnitKey, (skippedChildCount.get(childUnitKey) ?? 0) + childRelation.repeats)
		}
	}
	// console.error('No child unit matched for remainder', remainder)
	return outputMap
}
