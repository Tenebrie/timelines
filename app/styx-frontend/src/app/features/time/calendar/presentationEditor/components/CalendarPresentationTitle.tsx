import { useUpdateCalendarPresentationMutation } from '@api/calendarApi'
import { CalendarDraftPresentation } from '@api/types/calendarTypes'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { calendarEditorSlice } from '../../CalendarSlice'
import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	presentation: CalendarDraftPresentation
}

export const CalendarPresentationTitle = ({ presentation }: Props) => {
	const { calendar } = useSelector(getCalendarEditorState)
	const [savePresentation] = useUpdateCalendarPresentationMutation()

	const { updatePresentation } = calendarEditorSlice.actions
	const dispatch = useDispatch()

	const onSave = useEvent((name: string) => {
		if (!calendar || name === presentation.name || !name?.trim()) {
			return
		}
		dispatch(updatePresentation({ presentationId: presentation.id, delta: { name } }))
		savePresentation({
			calendarId: calendar.id,
			presentationId: presentation.id,
			body: { name },
		})
	})

	return <EditableTitle value={presentation.name} onSave={onSave} data-testid="CalendarPresentationTitle" />
}
