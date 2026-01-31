import { useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Add from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

type Props = {
	parent: CalendarDraftUnit
}

export function AddChildForm({ parent }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const availableUnits = useMemo(() => {
		if (!calendar) {
			return []
		}
		return calendar.units.filter((u) => {
			return u.id !== parent.id
		})
	}, [calendar, parent.id])

	const [selectedUnit, setSelectedUnit] = useState<CalendarDraftUnit | null>(availableUnits[0] ?? null)
	const [label, setLabel] = useState('')
	const [repeats, setRepeats] = useState(1)

	const [updateUnit] = useUpdateCalendarUnitMutation()

	const handleAdd = async () => {
		if (!selectedUnit) {
			return
		}
		await updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: [
					...parent.children,
					{
						id: selectedUnit.id,
						label,
						repeats,
					},
				],
			},
		})

		setLabel('')
		setRepeats(1)
	}

	return (
		<Stack direction="row" gap={1}>
			<Select
				size="small"
				value={selectedUnit?.id ?? ''}
				onChange={(e) => {
					const unit = availableUnits.find((u) => u.id === e.target.value) ?? null
					setSelectedUnit(unit)
				}}
				sx={{ minWidth: 150 }}
			>
				{availableUnits.map((u) => (
					<MenuItem key={u.id} value={u.id}>
						{u.name}
					</MenuItem>
				))}
			</Select>
			<Input
				type="text"
				placeholder={'Custom label'}
				value={label}
				onChange={(e) => setLabel(e.target.value)}
			/>
			<Stack direction="row" alignItems="center" gap={0.5}>
				<Typography>×</Typography>
			</Stack>
			<TextField
				size="small"
				type="number"
				value={repeats}
				onChange={(e) => setRepeats(Math.max(1, parseInt(e.target.value) || 1))}
				sx={{ width: 80 }}
				slotProps={{ htmlInput: { min: 1 } }}
			/>
			<Button variant="outlined" startIcon={<Add />} onClick={handleAdd}>
				Add
			</Button>
		</Stack>
	)
}
