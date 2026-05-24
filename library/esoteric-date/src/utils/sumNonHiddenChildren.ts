import { CalendarDraftUnit, CalendarUnit } from '@api/types/calendarTypes'

export function sumNonHiddenChildren(
	allUnits: CalendarDraftUnit[] | CalendarUnit[],
	unit: CalendarDraftUnit | CalendarUnit,
) {
	let sum = 0
	for (const childRelation of unit.children) {
		const childUnit = allUnits.find((u) => u.id === childRelation.childUnitId)!
		if (childUnit.formatMode !== 'Hidden') {
			sum += childRelation.repeats
		} else {
			sum += sumNonHiddenChildren(allUnits, childUnit) * childRelation.repeats
		}
	}
	return sum
}
