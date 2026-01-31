import { useCreateCalendarUnitMutation } from '@api/calendarApi'
import Add from '@mui/icons-material/Add'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnit } from '../types'
import { CalendarUnitListItem } from './CalendarUnitListItem'

type Props = {
	selectedUnit: CalendarUnit | null
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
				width: 200,
				minWidth: 200,
				display: 'flex',
				flexDirection: 'column',
				borderRight: 1,
				borderColor: 'divider',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{/* Header with back button and calendar name */}
			<Stack sx={{ p: 2, pb: 1 }}>
				<Button
					startIcon={<ArrowBack />}
					onClick={() => onSelectUnit(undefined)}
					sx={{ justifyContent: 'flex-start', mb: 1 }}
				>
					Back
				</Button>
				<Typography variant="h6" noWrap title={calendar.name}>
					{calendar.name}
				</Typography>
			</Stack>

			<Divider />

			{/* Time Units section */}
			<Stack sx={{ p: 2, pb: 1 }} direction="row" alignItems="center" justifyContent="space-between">
				<Typography variant="subtitle2" color="text.secondary">
					Time Units
				</Typography>
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
						<Typography variant="subtitle2">New Time Unit</Typography>
						<TextField
							size="small"
							placeholder="Unit name"
							value={newUnitName}
							onChange={(e) => setNewUnitName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && onCreateUnit()}
							autoFocus
							fullWidth
						/>
						<Button variant="contained" size="small" onClick={onCreateUnit} disabled={!newUnitName.trim()}>
							Create
						</Button>
					</Stack>
				</Popover>
			</Stack>

			<List sx={{ flex: 1, overflow: 'auto' }}>
				{units.length === 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
						No units created yet
					</Typography>
				)}
				{units.map((unit) => (
					<CalendarUnitListItem
						key={unit.id}
						unit={unit}
						selectedUnit={selectedUnit}
						onSelectUnit={onSelectUnit}
					/>
				))}
			</List>
		</Box>
	)
}
