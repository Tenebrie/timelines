import { useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import Delete from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { getCalendarEditorState } from '../CalendarSliceSelectors'

type Props = {
	parent: CalendarDraftUnit
}

export function ChildrenList({ parent }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updateUnit] = useUpdateCalendarUnitMutation()
	const availableUnits = useMemo(() => {
		if (!calendar) {
			return []
		}
		return calendar.units.filter((u) => {
			return u.id !== parent.id
		})
	}, [calendar, parent.id])

	const onUpdateChild = useEvent((relationId: string, updates: Partial<CalendarDraftUnitChildRelation>) => {
		const newChildren = parent.children.map((c) => (c.id === relationId ? { ...c, ...updates } : c))
		updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: newChildren,
			},
		})
	})

	const onDeleteChild = useEvent((relationId: string) => {
		const newChildren = parent.children.filter((c) => c.id !== relationId)
		updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: newChildren,
			},
		})
	})

	if (!calendar) {
		return null
	}

	if (parent.children.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary" fontStyle="italic">
				This is a base unit with no children. Add children below to make it a composite unit.
			</Typography>
		)
	}

	return (
		<Stack gap={1}>
			{parent.children.map((child, index) => {
				const childUnit = calendar.units.find((u) => u.id === child.childUnitId)
				return (
					<Box
						key={child.id}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							p: 1,
							bgcolor: 'rgba(0, 0, 0, 0.05)',
							borderRadius: 1,
						}}
					>
						<Typography variant="body2" sx={{ minWidth: 30 }}>
							{index + 1}.
						</Typography>
						<Select
							size="small"
							value={child.childUnitId}
							onChange={(e) => onUpdateChild(child.id, { childUnitId: e.target.value })}
							sx={{ minWidth: 150 }}
						>
							{availableUnits.map((u) => (
								<MenuItem key={u.id} value={u.id}>
									{u.name}
								</MenuItem>
							))}
						</Select>
						<Typography>×</Typography>
						<TextField
							size="small"
							type="number"
							value={child.repeats}
							onChange={(e) =>
								onUpdateChild(child.id, {
									repeats: Math.max(1, parseInt(e.target.value) || 1),
								})
							}
							sx={{ width: 80 }}
							slotProps={{ htmlInput: { min: 1 } }}
						/>
						<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
							{childUnit && child.label && `(${child.label})`}
						</Typography>
						<IconButton size="small" onClick={() => onDeleteChild(child.id)}>
							<Delete fontSize="small" />
						</IconButton>
					</Box>
				)
			})}
		</Stack>
	)
}
