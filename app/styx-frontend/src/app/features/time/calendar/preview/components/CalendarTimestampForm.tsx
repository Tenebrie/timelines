import { UpdateCalendarApiArg, useUpdateCalendarMutation } from '@api/calendarApi'
import { CalendarDraft } from '@api/types/calendarTypes'
import TextField from '@mui/material/TextField'
import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

export function CalendarTimestampForm() {
	const [updateCalendar] = useUpdateCalendarMutation()

	const { calendar } = useSelector(getCalendarEditorState)

	const [calendarDraft, setCalendarDraft] = useState<CalendarDraft | null>(calendar)

	useEffect(() => {
		setCalendarDraft(calendar)
	}, [calendar])

	const onUpdateCalendarDebounced = useMemo(
		() =>
			debounce((calendarId: string, body: UpdateCalendarApiArg['body']) => {
				updateCalendar({
					calendarId,
					body,
				})
			}, 1000),
		[updateCalendar],
	)

	const onUpdateCalendar = useEvent((body: UpdateCalendarApiArg['body']) => {
		if (!calendarDraft) {
			return
		}
		onUpdateCalendarDebounced(calendarDraft.id, body)
		setCalendarDraft((prev) => {
			if (!prev) {
				return prev
			}
			return {
				...prev,
				...body,
			}
		})
	})

	return (
		<TextField
			label="Time Format"
			size="small"
			value={calendarDraft?.dateFormat ?? ''}
			onChange={(e) => onUpdateCalendar({ dateFormat: e.target.value })}
		/>
	)
}
