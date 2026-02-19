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

import { getCalendarEditorState } from '@/app/features/time/calendar/CalendarSliceSelectors'
import { useSelectedCalendarUnit } from '@/app/features/time/calendar/hooks/useSelectedCalendarUnit'

type Props = {
	parent: CalendarDraftUnit
}

export function CalendarUnitAddChildForm({ parent }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const availableUnits = useMemo(() => {
		if (!calendar) {
			return []
		}
		const ancestors = new Set<string>()
		const gatherAncestors = (unitId: string) => {
			const unit = calendar.units.find((u) => u.id === unitId)
			if (!unit) {
				return
			}
			for (const parents of unit.parents) {
				if (!ancestors.has(parents.parentUnitId)) {
					ancestors.add(parents.parentUnitId)
					gatherAncestors(parents.parentUnitId)
				}
			}
		}
		gatherAncestors(parent.id)

		return calendar.units.filter((u) => {
			return u.id !== parent.id && !ancestors.has(u.id)
		})
	}, [calendar, parent.id])

	const [selectedUnit, setSelectedUnit] = useState<CalendarDraftUnit | null>(availableUnits[0] ?? null)
	const [label, setLabel] = useState('')
	const [shortLabel, setShortLabel] = useState('')
	const [repeats, setRepeats] = useState(1)

	useSelectedCalendarUnit({
		unit: parent,
		onChange: () => {
			setSelectedUnit(null)
		},
	})

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
						childUnitId: selectedUnit.id,
						label: label || null,
						shortLabel: shortLabel || null,
						repeats,
					},
				],
			},
		})

		setLabel('')
		setShortLabel('')
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
				disabled={availableUnits.length === 0}
				displayEmpty
				renderValue={(value) => {
					if (availableUnits.length === 0) {
						return <i>No units available</i>
					}
					return availableUnits.find((u) => u.id === value)?.name ?? ''
				}}
				sx={{ minWidth: 150 }}
			>
				{availableUnits.map((u) => (
					<MenuItem key={u.id} value={u.id}>
						{u.name}
					</MenuItem>
				))}
			</Select>
			<Stack direction="row" alignItems="center" gap={0.5}>
				<Typography>x</Typography>
			</Stack>
			<TextField
				size="small"
				type="number"
				value={repeats}
				onChange={(e) => setRepeats(Math.max(1, parseInt(e.target.value) || 1))}
				sx={{ width: 80 }}
				slotProps={{ htmlInput: { min: 1 } }}
			/>
			<Input
				type="text"
				placeholder={'Label (e.g. January)'}
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				sx={{ minWidth: 140 }}
			/>
			<Input
				type="text"
				placeholder={'Short (e.g. Jan)'}
				value={shortLabel}
				onChange={(e) => setShortLabel(e.target.value)}
				sx={{ minWidth: 120 }}
			/>
			<Button variant="outlined" startIcon={<Add />} onClick={handleAdd}>
				Add
			</Button>
		</Stack>
	)
}
