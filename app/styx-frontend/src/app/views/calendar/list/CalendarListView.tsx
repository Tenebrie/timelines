import Add from '@mui/icons-material/Add'
import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'

import { useCreateCalendarMutation, useListCalendarsQuery } from '@/api/calendarApi'
import { formatTimeAgo } from '@/app/views/home/utils/formatTimeAgo'
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
			navigate({ to: '/calendar/$calendarId', params: { calendarId: result.data.id } })
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
		navigate({ to: '/calendar/$calendarId', params: { calendarId } })
	}

	const onEdit = (calendarId: string) => {
		navigate({ to: '/calendar/$calendarId', params: { calendarId } })
	}

	const onDelete = (calendar: { id: string; name: string }) => {
		// TODO: Add delete calendar modal
		console.info('Delete calendar:', calendar)
	}

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
						<IconButton
							size="small"
							onClick={handleOpenPopover}
							aria-label="Create new calendar"
							sx={{
								bgcolor: 'action.hover',
								'&:hover': {
									bgcolor: 'action.selected',
								},
							}}
						>
							<Add />
						</IconButton>
						<Popover
							open={Boolean(anchorEl)}
							anchorEl={anchorEl}
							onClose={handleClosePopover}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
						>
							<Stack sx={{ p: 2, gap: 1.5, minWidth: 250 }}>
								<Typography variant="subtitle2" fontWeight="bold">
									New Calendar
								</Typography>
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
					</Stack>
					<Divider sx={{ mb: 2 }} />
					<Stack gap={0.5}>
						{calendars?.map((calendar) => {
							const lastUpdated = formatTimeAgo(new Date(calendar.updatedAt))

							return (
								<ButtonBase
									key={calendar.id}
									onClick={() => onOpen(calendar.id)}
									sx={{
										width: '100%',
										borderRadius: 1,
										p: 1.5,
										justifyContent: 'flex-start',
										textAlign: 'left',
										'&:hover:not(:has(.MuiIconButton-root:hover))': {
											bgcolor: 'action.hover',
										},
									}}
								>
									<Stack
										direction="row"
										alignItems="center"
										justifyContent="space-between"
										width="100%"
										gap={1}
									>
										<Stack flex={1} minWidth={0}>
											<Typography
												variant="body1"
												sx={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{calendar.name}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Updated {lastUpdated}
											</Typography>
										</Stack>
										<Stack
											direction="row"
											gap={0.5}
											onClick={(e) => e.stopPropagation()}
											onMouseDown={(e) => e.stopPropagation()}
											sx={{ flexShrink: 0 }}
										>
											<Tooltip title="Edit calendar" disableInteractive enterDelay={500}>
												<IconButton
													size="small"
													aria-label="Edit calendar button"
													onClick={(e) => {
														e.stopPropagation()
														onEdit(calendar.id)
													}}
												>
													<Edit fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Delete calendar" disableInteractive enterDelay={500}>
												<IconButton
													size="small"
													aria-label="Delete calendar button"
													onClick={(e) => {
														e.stopPropagation()
														onDelete(calendar)
													}}
													color="error"
												>
													<Delete fontSize="small" />
												</IconButton>
											</Tooltip>
										</Stack>
									</Stack>
								</ButtonBase>
							)
						})}
						{(!calendars || calendars.length === 0) && (
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
