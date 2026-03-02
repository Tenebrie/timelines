import { useCreateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { CreatePopoverButton } from '@/ui-lib/components/PopoverButton/CreatePopoverButton'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnitListItem } from './CalendarUnitListItem'

type Props = {
	selectedUnit: CalendarDraftUnit | null
	onSelectUnit: (unitId: string | undefined) => void
}

export function CalendarUnitList({ selectedUnit, onSelectUnit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [newUnitName, setNewUnitName] = useState('')

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
				<CreatePopoverButton
					size="small"
					tooltip="Add time unit"
					onConfirm={onCreateUnit}
					confirmDisabled={!newUnitName.trim()}
					popoverBody={({ close }) => (
						<>
							<Typography variant="subtitle2" fontWeight="bold">
								New Time Unit
							</Typography>
							<TextField
								size="small"
								placeholder="Unit name"
								value={newUnitName}
								onChange={(e) => setNewUnitName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key !== 'Enter') {
										return
									}
									onCreateUnit()
									close()
								}}
								fullWidth
							/>
						</>
					)}
				/>
			</Stack>

			<Divider />

			<Stack sx={{ flex: 1, overflow: 'auto', pb: 1 }}>
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
