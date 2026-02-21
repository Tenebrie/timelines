import { CalendarDraftUnit, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import DragIndicator from '@mui/icons-material/DragIndicator'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useCalendarUnitChildDragDrop } from '@/app/features/time/calendar/hooks/useCalendarUnitChildDragDrop'
import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

import { useResolveCalendarChildUnitName } from '../../hooks/useResolveCalendarChildUnitName'
import { useResolveCalendarUnitName } from '../../hooks/useResolveCalendarUnitName'
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
	const unitName = useResolveCalendarUnitName({ unitId: parentUnitId })
	const childUnitName = useResolveCalendarChildUnitName({ relation: child })
	const { ref, ghostElement } = useCalendarUnitChildDragDrop({
		parentUnitId,
		child,
		index,
		name: childUnitName,
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
				<ConfirmPopoverButton
					type="delete"
					tooltip="Delete relation"
					prompt={
						<>
							Are you sure you want to remove <b>{childUnitName}</b> from <b>{unitName}</b>?
						</>
					}
					onConfirm={() => onDeleteChild(child.id)}
				/>
			</Box>
			<CalendarUnitChildDropHandle parentUnitId={parentUnitId} position={index + 1} onReorder={onReorder} />
			{ghostElement}
		</>
	)
}
