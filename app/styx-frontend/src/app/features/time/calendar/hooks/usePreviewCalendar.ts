import { useGetCalendarPreviewQuery } from '@api/calendarApi'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

export function usePreviewCalendar() {
	const { calendar } = useSelector(getCalendarEditorState)
	const { data } = useGetCalendarPreviewQuery({ calendarId: calendar?.id ?? '' }, { skip: !calendar?.id })

	return data
}
