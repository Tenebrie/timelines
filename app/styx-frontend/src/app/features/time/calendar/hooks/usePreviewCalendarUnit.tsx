import { useGetCalendarPreviewQuery } from '@api/calendarApi'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

type Props = {
	id: string
}

export function usePreviewCalendarUnit({ id }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const { data } = useGetCalendarPreviewQuery({ calendarId: calendar?.id ?? '' }, { skip: !calendar?.id })

	const unit = data?.units.find((u) => u.id === id) ?? null

	return unit
}
