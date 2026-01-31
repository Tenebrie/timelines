import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'

import { useCreateCalendarMutation, useListCalendarsQuery } from '@/api/calendarApi'
import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { TrunkatedSpan } from '@/app/components/TrunkatedTypography'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export function CalendarListView() {
	const [newCalendarName, setNewCalendarName] = useState('')
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const navigate = useStableNavigate()

	const { data: calendars, isLoading } = useListCalendarsQuery()
	const [createCalendar, { isLoading: isCreating }] = useCreateCalendarMutation()

	const handleCreateCalendar = useCallback(async () => {
		if (!newCalendarName.trim()) return

		const result = await createCalendar({ body: { name: newCalendarName.trim() } })
		if ('data' in result && result.data) {
			setNewCalendarName('')
			setAnchorEl(null)
			navigate({ to: '/calendars/$calendarId', params: { calendarId: result.data.id } })
		}
	}, [newCalendarName, createCalendar, navigate])

	const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClosePopover = () => {
		setAnchorEl(null)
		setNewCalendarName('')
	}

	const onOpen = (calendarId: string) => {
		navigate({ to: '/calendars/$calendarId', params: { calendarId } })
	}

	const onEdit = (calendarId: string) => {
		navigate({ to: '/calendars/$calendarId', params: { calendarId } })
	}

	const onDelete = (calendar: { id: string; name: string }) => {
		// TODO: Add delete calendar modal
		console.info('Delete calendar:', calendar)
	}

	if (isLoading) {
		return (
			<Container maxWidth="sm">
				<Stack alignItems="center" py={4}>
					<CircularProgress />
				</Stack>
			</Container>
		)
	}

	return (
		<Container maxWidth="sm">
			<Stack gap={2} position="relative">
				<OutlinedContainer
					style={{ minWidth: 400, borderRadius: 8 }}
					label="Your Calendars"
					secondaryLabel={
						<>
							<IconButton size="small" onClick={handleOpenPopover}>
								<Add />
							</IconButton>
							<Popover
								open={Boolean(anchorEl)}
								anchorEl={anchorEl}
								onClose={handleClosePopover}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
							>
								<Stack sx={{ p: 2, gap: 1, minWidth: 200 }}>
									<Typography variant="subtitle2">New Calendar</Typography>
									<TextField
										size="small"
										placeholder="Calendar name"
										value={newCalendarName}
										onChange={(e) => setNewCalendarName(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleCreateCalendar()}
										autoFocus
										fullWidth
										disabled={isCreating}
									/>
									<Button
										variant="contained"
										size="small"
										onClick={handleCreateCalendar}
										disabled={!newCalendarName.trim() || isCreating}
									>
										Create
									</Button>
								</Stack>
							</Popover>
						</>
					}
				>
					{calendars?.map((calendar) => (
						<Stack direction="row" justifyContent="space-between" key={calendar.id}>
							<Tooltip title={calendar.name} enterDelay={1000} arrow>
								<Button
									fullWidth
									onClick={() => onOpen(calendar.id)}
									style={{ textAlign: 'start', lineBreak: 'anywhere' }}
								>
									<TrunkatedSpan $lines={1} style={{ width: '100%' }}>
										- {calendar.name}
									</TrunkatedSpan>
								</Button>
							</Tooltip>
							<Stack direction="row" gap={0.5}>
								<Button aria-label="Edit calendar button" onClick={() => onEdit(calendar.id)}>
									<Edit />
								</Button>
								<Button aria-label="Delete calendar button" onClick={() => onDelete(calendar)}>
									<Delete />
								</Button>
							</Stack>
						</Stack>
					))}
					{(!calendars || calendars.length === 0) && (
						<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
							No calendars created yet. Click + to create one.
						</Typography>
					)}
				</OutlinedContainer>
			</Stack>
		</Container>
	)
}
