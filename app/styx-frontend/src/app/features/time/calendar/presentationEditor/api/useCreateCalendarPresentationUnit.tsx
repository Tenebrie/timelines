import { useCreateCalendarPresentationUnitMutation } from '@api/calendarApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'
import { NewUnitData } from '../editor/CalendarPresentationEditorPanel'

type Props = {
	presentationId: string
}

export function useCreateCalendarPresentationUnit({ presentationId }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [createUnit, status] = useCreateCalendarPresentationUnitMutation()

	const commit = useCallback(
		async (data: NewUnitData) => {
			if (!calendar) {
				throw new Error('No calendar loaded')
			}

			const result = parseApiResponse(
				await createUnit({
					calendarId: calendar.id,
					presentationId,
					body: data,
				}),
			)
			if (result.error) {
				return null
			}

			return result.response
		},
		[calendar, createUnit, presentationId],
	)

	return [commit, status] as const
}
