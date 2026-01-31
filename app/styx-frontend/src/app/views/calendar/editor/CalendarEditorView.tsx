import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useGetCalendarQuery } from '@/api/calendarApi'
import { CalendarEditor } from '@/app/features/time/calendar/CalendarEditor'
import { calendarEditorSlice } from '@/app/features/time/calendar/CalendarSlice'

type Props = {
	calendarId: string
}

export function CalendarEditorView({ calendarId }: Props) {
	const { data: calendar, isLoading } = useGetCalendarQuery({ calendarId })

	const { setCalendarDraft: setCalendar } = calendarEditorSlice.actions
	const dispatch = useDispatch()
	useEffect(() => {
		dispatch(setCalendar(calendar ?? null))
	}, [calendar, setCalendar, dispatch])

	if (isLoading) {
		return (
			<Stack width="100%" height="100%" alignItems="center" justifyContent="center">
				<CircularProgress />
			</Stack>
		)
	}

	if (!calendar) {
		return null
	}

	return (
		<Stack
			width="calc(100% - 48px)"
			padding="8px 24px"
			sx={{ alignItems: 'center', justifyContent: 'center' }}
		>
			<Paper sx={{ width: '100%', maxWidth: '1500px', height: 'calc(100vh - 64px - 16px)' }}>
				<CalendarEditor />
			</Paper>
		</Stack>
	)
}
