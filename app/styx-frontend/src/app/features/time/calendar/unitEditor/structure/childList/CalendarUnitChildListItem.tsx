import { CalendarDraftUnit, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import Delete from '@mui/icons-material/Delete'
import DragIndicator from '@mui/icons-material/DragIndicator'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useCalendarUnitChildDragDrop } from '@/app/features/time/calendar/hooks/useCalendarUnitChildDragDrop'

import { CalendarUnitRelationLabels } from '../components/CalendarUnitRelationLabels'
import { CalendarUnitChildDropHandle } from './CalendarUnitChildDropHandle'

type Props = {
	parentUnitId: string
	child: CalendarDraftUnitChildRelation
	index: number
	availableUnits: CalendarDraftUnit[]
	onUpdateChild: (relationId: string, updates: Partial<CalendarDraftUnitChildRelation>) => void
	onDeleteChild: (relationId: string) => void
	onReorder: (fromIndex: number, toIndex: number) => void
}

export function CalendarUnitChildListItem({
	parentUnitId,
	child,
	index,
	availableUnits,
	onUpdateChild,
	onDeleteChild,
	onReorder,
}: Props) {
	const { ref, ghostElement } = useCalendarUnitChildDragDrop({
		parentUnitId,
		child,
		index,
		name: availableUnits.find((u) => u.id === child.childUnitId)?.name ?? 'Unknown unit',
		onReorder,
	})

	return (
		<>
			<Box
				ref={ref}
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					p: 1,
					bgcolor: 'rgba(0, 0, 0, 0.05)',
					borderRadius: 1,
				}}
			>
				<DragIndicator fontSize="small" sx={{ cursor: 'grab', opacity: 0.5, '&:hover': { opacity: 1 } }} />
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
				<Typography>x</Typography>
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
				<CalendarUnitRelationLabels
					label={child.label}
					shortLabel={child.shortLabel}
					onChange={(label, shortLabel) => onUpdateChild(child.id, { label, shortLabel })}
				/>
				<IconButton
					size="small"
					onClick={() => onDeleteChild(child.id)}
					color="error"
					sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
				>
					<Delete fontSize="small" />
				</IconButton>
			</Box>
			<CalendarUnitChildDropHandle parentUnitId={parentUnitId} position={index + 1} onReorder={onReorder} />
			{ghostElement}
		</>
	)
}
