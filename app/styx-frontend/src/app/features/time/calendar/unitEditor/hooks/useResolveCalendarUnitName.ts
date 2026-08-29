import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	unitId: string
}

export function useResolveCalendarUnitName({ unitId }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const allUnits = useMemo(() => calendar?.units ?? [], [calendar])

	const targetUnit = allUnits.find((u) => u.id === unitId)
	return targetUnit?.name ?? ''
}
