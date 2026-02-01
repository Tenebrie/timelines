import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useCalendarUnitDragDrop } from '../hooks/useCalendarUnitDragDrop'
import { CalendarUnitListDropHandle } from './components/CalendarUnitListDropHandle'
import { DeleteUnitButton } from './components/DeleteUnitButton'

type Props = {
	unit: CalendarDraftUnit
	selectedUnit: CalendarDraftUnit | null
	onSelectUnit: (unitId: string | undefined) => void
}

export function CalendarUnitListItem({ unit, selectedUnit, onSelectUnit }: Props) {
	const { ref, ghostElement } = useCalendarUnitDragDrop({ unit })
	const isSelected = selectedUnit?.id === unit.id

	return (
		<>
			<CalendarUnitListDropHandle position={unit.position} />
			<Box ref={ref} sx={{ px: 0.5 }}>
				<Button
					onClick={() => onSelectUnit(unit.id)}
					sx={{
						width: '100%',
						borderRadius: 1,
						padding: '8px 16px',
						justifyContent: 'flex-start',
						textAlign: 'left',
						bgcolor: isSelected ? 'action.selected' : 'transparent',
						'&:has(.MuiIconButton-root:hover)': {
							bgcolor: isSelected ? 'action.selected' : 'transparent',
						},
						'&:hover:not(:has(.MuiIconButton-root:hover))': {
							bgcolor: isSelected ? 'action.selected' : 'action.hover',
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
								{unit.name}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{unit.children.length > 0 ? `${unit.children.length} children` : 'Base unit'}
							</Typography>
						</Stack>
						<DeleteUnitButton unitId={unit.id} unitName={unit.name} />
					</Stack>
				</Button>
			</Box>
			{ghostElement}
		</>
	)
}
