import {
	UpdateCalendarPresentationUnitApiArg,
	useUpdateCalendarPresentationUnitMutation,
} from '@api/calendarApi'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	presentationId: string
}

export function useUpdateCalendarPresentationUnit({ presentationId }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const [updateUnit, status] = useUpdateCalendarPresentationUnitMutation()

	const commit = useCallback(
		async (unitId: string, data: UpdateCalendarPresentationUnitApiArg['body']) => {
			if (!calendar) {
				throw new Error('No calendar loaded')
			}

			const result = parseApiResponse(
				await updateUnit({
					calendarId: calendar.id,
					presentationId,
					unitId,
					body: data,
				}),
			)
			if (result.error) {
				return null
			}

			return result.response
		},
		[calendar, updateUnit, presentationId],
	)

	return [commit, status] as const
}
