import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

import { useListCalendarsQuery } from '@/api/calendarApi'

import { CalendarListCreateNewButton } from './CalendarListCreateNewButton'
import { CalendarListItem } from './CalendarListItem'

export function CalendarList() {
	const { data: calendars, isLoading } = useListCalendarsQuery()

	const sortedCalendars = useMemo(() => {
		if (!calendars) {
			return []
		}
		return [...calendars].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
	}, [calendars])

	if (isLoading) {
		return (
			<Stack width="100%" height="100%" alignItems="center" justifyContent="center">
				<CircularProgress />
			</Stack>
		)
	}

	return (
		<Stack width="100%" height="100%" alignItems="center" sx={{ overflowY: 'auto' }}>
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
					<Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
						<Stack direction="row" alignItems="center" gap={2}>
							<Box
								sx={{
									p: 1,
									borderRadius: 1.5,
									bgcolor: 'primary.main',
									color: 'primary.contrastText',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<CalendarMonth fontSize="small" />
							</Box>
							<Typography variant="h6" fontWeight="bold">
								Your Calendars
							</Typography>
						</Stack>

						<CalendarListCreateNewButton />
					</Stack>
					<Divider sx={{ mb: 2 }} />
					<Stack gap={0.5}>
						{sortedCalendars.map((calendar) => (
							<CalendarListItem key={calendar.id} calendar={calendar} />
						))}
						{(!sortedCalendars || sortedCalendars.length === 0) && (
							<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
								No calendars yet. Click the + button to create one!
							</Typography>
						)}
					</Stack>
				</Paper>
			</Container>
		</Stack>
	)
}
