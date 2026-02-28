import { useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { calendarEditorSlice } from '../../CalendarSlice'
import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	unit: CalendarDraftUnit
}

export const CalendarUnitTitle = ({ unit }: Props) => {
	const { calendar } = useSelector(getCalendarEditorState)
	const [editCalendarUnit] = useUpdateCalendarUnitMutation()

	const { updateUnit } = calendarEditorSlice.actions
	const dispatch = useDispatch()

	const onSave = useEvent((name: string) => {
		if (!calendar || name === unit.name || !name?.trim()) {
			return
		}
		dispatch(updateUnit({ unitId: unit.id, delta: { name } }))
		editCalendarUnit({
			calendarId: calendar.id,
			unitId: unit.id,
			body: { name },
		})
	})

	return <EditableTitle value={unit.name} onSave={onSave} data-testid="CalendarUnitTitle" />
}
