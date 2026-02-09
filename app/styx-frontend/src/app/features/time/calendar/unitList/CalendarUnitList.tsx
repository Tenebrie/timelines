import { useCreateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Add from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnitListItem } from './CalendarUnitListItem'

type Props = {
	selectedUnit: CalendarDraftUnit | null
	onSelectUnit: (unitId: string | undefined) => void
}

export function CalendarUnitList({ selectedUnit, onSelectUnit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [newUnitName, setNewUnitName] = useState('')
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

	const [createUnit] = useCreateCalendarUnitMutation()

	const onCreateUnit = async () => {
		if (!newUnitName.trim() || !calendar) {
			return
		}

		await createUnit({
			calendarId: calendar.id,
			body: {
				name: newUnitName.trim(),
			},
		})
		setNewUnitName('')
		setAnchorEl(null)
	}

	const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClosePopover = () => {
		setAnchorEl(null)
		setNewUnitName('')
	}

	const units = calendar ? calendar.units : []

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
			{/* Time Units section */}
			<Stack sx={{ px: 2, py: 1.5 }} direction="row" alignItems="center" justifyContent="space-between">
				<Typography variant="body2" color="text.secondary" fontWeight="medium">
					Time Units
				</Typography>
				<IconButton
					size="small"
					onClick={handleOpenPopover}
					aria-label="Add time unit"
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
							New Time Unit
						</Typography>
						<TextField
							size="small"
							placeholder="Unit name"
							value={newUnitName}
							onChange={(e) => setNewUnitName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && onCreateUnit()}
							fullWidth
						/>
						<Button variant="contained" size="small" onClick={onCreateUnit} disabled={!newUnitName.trim()}>
							Create
						</Button>
					</Stack>
				</Popover>
			</Stack>

			<Divider />

			<Stack sx={{ flex: 1, overflow: 'auto', py: 1 }}>
				{units.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
						No units created yet.
						<br />
						Click + to add one.
					</Typography>
				)}
				{units.map((unit) => (
					<CalendarUnitListItem
						key={unit.id}
						unit={unit}
						isSelected={selectedUnit?.id === unit.id}
						onSelectUnit={onSelectUnit}
					/>
				))}
			</Stack>
		</Box>
	)
}
