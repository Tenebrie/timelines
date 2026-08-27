import { CalendarUnit } from '@api/types/calendarTypes'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	relation: CalendarUnit['children'][number]
}

export function useResolveCalendarChildUnitName({ relation }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const allUnits = useMemo(() => calendar?.units ?? [], [calendar])

	const targetUnit = allUnits.find((u) => u.id === relation.childUnitId)
	if (!targetUnit) {
		return ''
	}

	if (relation.label) {
		return relation.label
	}
	return targetUnit.name
}
