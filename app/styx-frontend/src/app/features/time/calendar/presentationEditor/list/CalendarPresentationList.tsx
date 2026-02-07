import {
	useCreateCalendarPresentationMutation,
	useDeleteCalendarPresentationMutation,
} from '@api/calendarApi'
import { CalendarDraftPresentation } from '@api/types/calendarTypes'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	selectedPresentation: CalendarDraftPresentation | null
	onSelectPresentation: (presentationId: string | undefined) => void
}

export function CalendarPresentationList({ selectedPresentation, onSelectPresentation }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [newPresentationName, setNewPresentationName] = useState('')
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

	const [createPresentation] = useCreateCalendarPresentationMutation()
	const [deletePresentation] = useDeleteCalendarPresentationMutation()

	const onCreatePresentation = async () => {
		if (!newPresentationName.trim() || !calendar) {
			return
		}

		await createPresentation({
			calendarId: calendar.id,
			body: {
				name: newPresentationName.trim(),
			},
		})
		setNewPresentationName('')
		setAnchorEl(null)
	}

	const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClosePopover = () => {
		setAnchorEl(null)
		setNewPresentationName('')
	}

	const handleDeletePresentation = async (presentationId: string) => {
		if (!calendar) return
		await deletePresentation({
			calendarId: calendar.id,
			presentationId,
		})
		if (selectedPresentation?.id === presentationId) {
			onSelectPresentation(undefined)
		}
	}

	// Sort presentations by smallest unit duration (biggest at top)
	const sortedPresentations = [...(calendar?.presentations ?? [])].sort((a, b) => {
		const minDurationA = Math.min(...a.units.map((u) => u.unit.duration), Infinity)
		const minDurationB = Math.min(...b.units.map((u) => u.unit.duration), Infinity)
		// If no units, put at bottom
		if (minDurationA === Infinity && minDurationB === Infinity) return 0
		if (minDurationA === Infinity) return 1
		if (minDurationB === Infinity) return -1
		// Bigger duration = higher in list (descending)
		return minDurationB - minDurationA
	})

	if (!calendar) {
		return null
	}

	return (
		<Box
			sx={{
				width: 240,
				minWidth: 240,
				display: 'flex',
				flexDirection: 'column',
				borderColor: 'divider',
				position: 'sticky',
				top: 0,
				alignSelf: 'flex-start',
			}}
		>
			<Stack sx={{ px: 2, py: 1.5 }} direction="row" alignItems="center" justifyContent="space-between">
				<Typography variant="body2" color="text.secondary" fontWeight="medium">
					Levels
				</Typography>
				<IconButton
					size="small"
					onClick={handleOpenPopover}
					aria-label="Add level"
					sx={{
						bgcolor: 'action.hover',
						'&:hover': {
							bgcolor: 'action.selected',
						},
					}}
				>
					<Add fontSize="small" />
				</IconButton>
				<Popover
					open={Boolean(anchorEl)}
					anchorEl={anchorEl}
					onClose={handleClosePopover}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					slotProps={{
						paper: {
							onAnimationEnd: (e) => {
								const input = e.currentTarget.querySelector('input')
								input?.focus()
							},
						},
					}}
				>
					<Stack sx={{ p: 2, gap: 1.5, minWidth: 220 }}>
						<Typography variant="subtitle2" fontWeight="bold">
							New Zoom Level
						</Typography>
						<TextField
							size="small"
							placeholder="Name"
							value={newPresentationName}
							onChange={(e) => setNewPresentationName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && onCreatePresentation()}
							fullWidth
						/>
						<Button
							variant="contained"
							size="small"
							onClick={onCreatePresentation}
							disabled={!newPresentationName.trim()}
						>
							Create
						</Button>
					</Stack>
				</Popover>
			</Stack>

			<Divider />

			<Stack sx={{ flex: 1, overflow: 'auto', py: 1 }}>
				{sortedPresentations.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
						No zoom levels created yet.
						<br />
						Click + to add one.
					</Typography>
				)}
				{sortedPresentations.map((presentation) => (
					<Box key={presentation.id} sx={{ px: 0.5 }}>
						<Button
							component="div"
							onClick={() => onSelectPresentation(presentation.id)}
							sx={{
								width: '100%',
								borderRadius: 1,
								padding: '8px 16px',
								justifyContent: 'flex-start',
								textAlign: 'left',
								bgcolor: selectedPresentation?.id === presentation.id ? 'action.selected' : 'transparent',
								'&:has(.MuiIconButton-root:hover)': {
									bgcolor: selectedPresentation?.id === presentation.id ? 'action.selected' : 'transparent',
								},
								'&:hover:not(:has(.MuiIconButton-root:hover))': {
									bgcolor: selectedPresentation?.id === presentation.id ? 'action.selected' : 'action.hover',
								},
								transition: 'background-color 0.2s ease',
							}}
						>
							<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
								<Stack flex={1} minWidth={0}>
									<Typography
										variant="body2"
										sx={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{presentation.name}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{presentation.units.length === 0
											? 'No units'
											: `${presentation.units.length} unit${presentation.units.length === 1 ? '' : 's'}`}
									</Typography>
								</Stack>
								<Tooltip title="Delete">
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation()
											handleDeletePresentation(presentation.id)
										}}
										sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
									>
										<Delete fontSize="small" />
									</IconButton>
								</Tooltip>
							</Stack>
						</Button>
					</Box>
				))}
			</Stack>
		</Box>
	)
}
