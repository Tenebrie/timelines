import { useDeleteCalendarPresentationUnitMutation } from '@api/calendarApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	presentationId: string
}

export function useDeleteCalendarPresentationUnit({ presentationId }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [deleteUnit, status] = useDeleteCalendarPresentationUnitMutation()

	const commit = useCallback(
		async (unitId: string) => {
			if (!calendar) {
				throw new Error('No calendar loaded')
			}

			const result = parseApiResponse(
				await deleteUnit({
					calendarId: calendar.id,
					presentationId,
					unitId,
				}),
			)
			if (result.error) {
				return null
			}

			return result.response
		},
		[calendar, deleteUnit, presentationId],
	)

	return [commit, status] as const
}
