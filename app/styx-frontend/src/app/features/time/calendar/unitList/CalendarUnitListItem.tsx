import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { useCalendarUnitDragDrop } from '../hooks/useCalendarUnitDragDrop'
import { CalendarUnitListDropHandle } from './components/CalendarUnitListDropHandle'
import { DeleteUnitButton } from './components/DeleteUnitButton'

type Props = {
	unit: CalendarDraftUnit
	selectedUnit: CalendarDraftUnit | null
	onSelectUnit: (unitId: string | undefined) => void
}

export function CalendarUnitListItem({ unit, selectedUnit, onSelectUnit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const { ref, ghostElement } = useCalendarUnitDragDrop({ unit })
	const isSelected = selectedUnit?.id === unit.id

	const totalChildCount = (() => {
		let total = 0
		unit.children.forEach((child) => {
			total += child.repeats
		})
		return total
	})()

	const unitLabel = (() => {
		const labelList: string[] = []
		if (unit.treeDepth === 0 && totalChildCount === 0) {
			return 'Standalone unit'
		}
		if (unit.treeDepth === 0) {
			labelList.push('Root unit')
		}
		if (totalChildCount > 0) {
			const totalCount: Map<string, { name: string; count: number; plural: string }> = new Map()
			unit.children.forEach((child) => {
				const existingData = calendar?.units.find((unit) => unit.id === child.childUnitId)

				if (!existingData) {
					return
				}
				const nameToUse = existingData.displayName ?? existingData.name
				const pluralNameToUse = existingData.displayNamePlural ?? existingData.name
				const existing = totalCount.get(nameToUse)
				if (existing) {
					existing.count += child.repeats
				} else {
					totalCount.set(nameToUse, {
						name: nameToUse,
						count: child.repeats,
						plural: pluralNameToUse,
					})
				}
			})
			const label = totalCount
				.values()
				.toArray()
				.map((data) => `${data.count} ${data.count === 1 ? data.name : data.plural}`)
				.join(', ')
			labelList.push(label)
		} else {
			labelList.push('Base unit')
		}
		return labelList.join(' | ')
	})()

	return (
		<>
			<CalendarUnitListDropHandle position={unit.position} />
			<Box ref={ref} sx={{ px: 0.5 }}>
				<Button
					component="div"
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
								{unitLabel}
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
