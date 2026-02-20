import { useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

export function useMoveCalendarUnit() {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updateCalendarUnit, params] = useUpdateCalendarUnitMutation()

	const commit = async (data: { id: string; position: number }) => {
		if (!calendar) {
			return
		}

		const { response, error } = parseApiResponse(
			await updateCalendarUnit({
				calendarId: calendar.id,
				unitId: data.id,
				body: {
					position: data.position,
				},
			}),
		)
		if (error) {
			// worldWikiApi.util.invalidateTags(['worldWiki'])
			return
		}

		return response
	}

	return [commit, params] as const
}
