import Stack from '@mui/material/Stack'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EmptyState } from '@/app/features/time/calendar/components/EmptyState'
import { UnitEditor } from '@/app/features/time/calendar/components/UnitEditor'
import { CalendarUnitList } from '@/app/features/time/calendar/unitList/CalendarUnitList'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { getCalendarEditorState } from './CalendarSliceSelectors'

export type { CalendarChangeRequest } from './types'

export function CalendarEditor() {
	const { calendar } = useSelector(getCalendarEditorState)
	const { unit: selectedUnitId } = useSearch({ from: '/calendars/$calendarId' })

	const navigate = useStableNavigate({ from: '/calendars/$calendarId' })
	const onSelectUnit = useEvent((unitId: string | undefined) => {
		navigate({ search: (prev) => ({ ...prev, unit: unitId }) })
	})

	const selectedUnit = useMemo(
		() => calendar?.units.find((u) => u.id === selectedUnitId) ?? null,
		[calendar, selectedUnitId],
	)

	return (
		<Stack direction="row" sx={{ height: '100%', overflow: 'hidden' }}>
			<CalendarUnitList selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} />
			<Stack sx={{ flex: 1, overflow: 'auto', p: 3 }}>
				{selectedUnit ? (
					<UnitEditor unit={selectedUnit} />
				) : (
					<EmptyState hasUnits={(calendar?.units.length ?? 0) > 0} />
				)}
			</Stack>
		</Stack>
	)
}
