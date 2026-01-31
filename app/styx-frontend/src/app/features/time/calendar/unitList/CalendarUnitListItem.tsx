import { useDeleteCalendarUnitMutation } from '@api/calendarApi'
import Delete from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { useCalendarUnitDragDrop } from '../hooks/useCalendarUnitDragDrop'
import { CalendarUnit } from '../types'
import { CalendarUnitListDropHandle } from './components/CalendarUnitListDropHandle'

type Props = {
	unit: CalendarUnit
	selectedUnit: CalendarUnit | null
	onSelectUnit: (unitId: string | undefined) => void
}

export function CalendarUnitListItem({ unit, selectedUnit, onSelectUnit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [deleteUnit] = useDeleteCalendarUnitMutation()
	const onDeleteUnit = async (unitId: string) => {
		if (!calendar) {
			return
		}

		await deleteUnit({
			calendarId: calendar.id,
			unitId,
		})
	}

	const { ref, ghostElement } = useCalendarUnitDragDrop({ unit })

	return (
		<>
			<CalendarUnitListDropHandle position={unit.position} />
			<ListItemButton
				key={unit.id}
				ref={ref}
				selected={selectedUnit?.id === unit.id}
				onClick={() => onSelectUnit(unit.id)}
			>
				<ListItemText
					primary={unit.name}
					secondary={unit.children.length > 0 ? `${unit.children.length} children` : 'Base unit'}
				/>
				<IconButton
					size="small"
					onClick={(e) => {
						e.stopPropagation()
						onDeleteUnit(unit.id)
					}}
				>
					<Delete fontSize="small" />
				</IconButton>
			</ListItemButton>
			{ghostElement}
		</>
	)
}
