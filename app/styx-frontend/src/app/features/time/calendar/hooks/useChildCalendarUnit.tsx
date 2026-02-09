import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

export function useChildCalendarUnit(childUnitId: string) {
	const { calendar } = useSelector(getCalendarEditorState)

	return useMemo(() => {
		return calendar?.units.find((unit) => unit.id === childUnitId) ?? null
	}, [childUnitId, calendar])
}
