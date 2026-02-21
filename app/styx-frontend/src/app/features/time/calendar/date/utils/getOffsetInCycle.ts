import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

export function getOffsetInCycle(
	allUnits: CalendarUnit[] | CalendarDraftUnit[],
	unit: CalendarUnit | CalendarDraftUnit,
	index: number,
): number {
	// Find hidden parent(s)
	const hiddenParents = unit.parents.filter((p) => {
		const parentUnit = allUnits.find((u) => u.id === p.parentUnitId)
		return parentUnit && parentUnit.formatMode !== 'Hidden'
	})

	if (hiddenParents.length > 0) {
		// Has non-hidden parent, use simple multiplication
		return index * Number(unit.duration)
	}

	// Find hidden parents
	const hiddenParentRelations = unit.parents.filter((p) => {
		const parentUnit = allUnits.find((u) => u.id === p.parentUnitId)
		return parentUnit && parentUnit.formatMode === 'Hidden'
	})

	if (hiddenParentRelations.length === 0) {
		// No hidden parent either, use simple multiplication
		return index * Number(unit.duration)
	}

	// For hidden parents, we need to walk through the cycle structure
	// accounting for siblings with the same formatShorthand
	for (const parentRelation of hiddenParentRelations) {
		const parentUnit = allUnits.find((u) => u.id === parentRelation.parentUnitId)
		if (!parentUnit) continue

		// Calculate how many full cycles and remainder
		const cycleSize = parentUnit.children
			.filter((c) => {
				const childUnit = allUnits.find((u) => u.id === c.childUnitId)
				return childUnit && childUnit.formatShorthand === unit.formatShorthand
			})
			.reduce((sum, c) => sum + c.repeats, 0)

		const fullCycles = Math.floor(index / cycleSize)
		let indexInCycle = index % cycleSize

		// Handle negative modulo: in JS, -1 % 5 = -1, but we want 4
		if (indexInCycle < 0) {
			indexInCycle += cycleSize
		}

		// Calculate offset for full cycles
		let offset = fullCycles * Number(parentUnit.duration)

		// Walk through children to find position within current cycle
		let remainingIndex = indexInCycle
		for (const childRelation of parentUnit.children) {
			const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)
			if (!childUnit) continue

			// Check if this child shares our formatShorthand
			if (childUnit.formatShorthand === unit.formatShorthand) {
				if (remainingIndex < childRelation.repeats) {
					// Found it! Add offset for the instances within this child
					if (childUnit.id === unit.id) {
						offset += remainingIndex * Number(childUnit.duration)
					} else {
						// Different unit with same shorthand, recurse
						offset += getOffsetInCycle(allUnits, childUnit, remainingIndex)
					}
					return offset
				}
				// Skip all instances of this child and add their duration to offset
				offset += childRelation.repeats * Number(childUnit.duration)
				remainingIndex -= childRelation.repeats
			} else {
				// Different shorthand, always skip these when counting
				offset += childRelation.repeats * Number(childUnit.duration)
			}
		}
	}

	// Fallback
	return index * Number(unit.duration)
}
