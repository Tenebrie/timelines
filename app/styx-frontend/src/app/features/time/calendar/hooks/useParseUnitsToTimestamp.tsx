import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'
import useEvent from 'react-use-event-hook'

type ParsedTimestamp = Map<string, ParsedTimestampEntry>
type ParsedTimestampEntry = {
	value: number
	formatShorthand?: string
	customLabel?: string
}

export function useParseUnitsToTimestamp({ units }: { units: CalendarDraftUnit[] | CalendarUnit[] }) {
	// Helper to calculate offset within a hidden parent cycle for a unit at a given index
	const getOffsetInCycle = (unit: CalendarDraftUnit | CalendarUnit, index: number): number => {
		// Find hidden parent(s)
		const hiddenParents = unit.parents.filter((p) => {
			const parentUnit = units.find((u) => u.id === p.parentUnitId)
			return parentUnit && parentUnit.formatMode !== 'Hidden'
		})

		if (hiddenParents.length > 0) {
			// Has non-hidden parent, use simple multiplication
			return index * unit.duration
		}

		// Find hidden parents
		const hiddenParentRelations = unit.parents.filter((p) => {
			const parentUnit = units.find((u) => u.id === p.parentUnitId)
			return parentUnit && parentUnit.formatMode === 'Hidden'
		})

		if (hiddenParentRelations.length === 0) {
			// No hidden parent either, use simple multiplication
			return index * unit.duration
		}

		// For hidden parents, we need to walk through the cycle structure
		// accounting for siblings with the same formatShorthand
		for (const parentRelation of hiddenParentRelations) {
			const parentUnit = units.find((u) => u.id === parentRelation.parentUnitId)
			if (!parentUnit) continue

			// Calculate how many full cycles and remainder
			const cycleSize = parentUnit.children
				.filter((c) => {
					const childUnit = units.find((u) => u.id === c.childUnitId)
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
			let offset = fullCycles * parentUnit.duration

			// Walk through children to find position within current cycle
			let remainingIndex = indexInCycle
			for (const childRelation of parentUnit.children) {
				const childUnit = units.find((u) => u.id === childRelation.childUnitId)
				if (!childUnit) continue

				// Check if this child shares our formatShorthand
				if (childUnit.formatShorthand === unit.formatShorthand) {
					if (remainingIndex < childRelation.repeats) {
						// Found it! Add offset for the instances within this child
						if (childUnit.id === unit.id) {
							offset += remainingIndex * childUnit.duration
						} else {
							// Different unit with same shorthand, recurse
							offset += getOffsetInCycle(childUnit, remainingIndex)
						}
						return offset
					}
					// Skip all instances of this child and add their duration to offset
					offset += childRelation.repeats * childUnit.duration
					remainingIndex -= childRelation.repeats
				} else {
					// Different shorthand, always skip these when counting
					offset += childRelation.repeats * childUnit.duration
				}
			}
		}

		// Fallback
		return index * unit.duration
	}

	const parse = useEvent(({ parsedTimestamp }: { parsedTimestamp: ParsedTimestamp }) => {
		// Build list of units to consider
		const entries: Array<{ unit: CalendarDraftUnit | CalendarUnit; entry: ParsedTimestampEntry }> = []

		for (const [unitId, entry] of parsedTimestamp.entries()) {
			const unit = units.find((u) => u.id === unitId)
			if (!unit) {
				continue
			}

			// Skip hidden units that have visible children in the parsed map
			// (their children absorbed their time contributions)
			if (unit.formatMode === 'Hidden') {
				const hasVisibleChildInMap = unit.children.some((childRelation) => {
					const childUnit = units.find((u) => u.id === childRelation.childUnitId)
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
				return sum + getOffsetInCycle(unit, entry.value)
			}, 0)
		} else {
			// Use smallest duration unit from separate roots
			const smallest = entries.reduce((min, current) =>
				current.unit.duration < min.unit.duration ? current : min,
			)
			return smallest.entry.value * smallest.unit.duration
		}
	})

	return parse
}
