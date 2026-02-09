import { CalendarDraftUnit, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'

import { useChildCalendarUnit } from '@/app/features/time/calendar/hooks/useChildCalendarUnit'

type Props = {
	unit: CalendarDraftUnit
	visible: boolean
}

type RecursiveProps = Omit<Props, 'visible'> & {
	depth: number
	label?: string | null
	repeats: number
}

/**
 * Top level export
 */
export function CalendarUnitPreviewTree({ unit, visible }: Props) {
	const [rendered, setRendered] = useState(visible)

	useEffect(() => {
		if (visible) {
			setRendered(true)
		}
	}, [visible])

	if (!rendered) {
		return null
	}

	return <CalendarUnitPreviewRecursive depth={0} unit={unit} label={null} repeats={1} />
}

/**
 * Recursive component to display a calendar unit and its children
 */
function CalendarUnitPreviewRecursive({ depth, unit, label, repeats }: RecursiveProps) {
	const displayedLabel = useMemo(() => {
		let val = unit.name
		if (label) {
			val = `${label}`
		}
		if (repeats > 1) {
			val += ` x${repeats}`
		}
		return val
	}, [label, repeats, unit.name])

	if (depth > 10 || !unit) {
		return null
	}

	const hasChildren = unit.children.length > 0

	return (
		<Box>
			<Typography variant="body2" color="text.secondary">
				{displayedLabel}
				{hasChildren && ':'}
			</Typography>
			{hasChildren && (
				<Box
					sx={{
						pl: 3,
						borderLeft: '2px solid rgba(128, 128, 128, 0.3)',
						ml: 1.5,
					}}
				>
					{unit.children.map((child) => (
						<PreviewChild key={child.id} unit={child} depth={depth + 1} />
					))}
				</Box>
			)}
		</Box>
	)
}

/**
 * Conditional wrapper for each child
 */
function PreviewChild({ depth, unit }: { depth: number; unit: CalendarDraftUnitChildRelation }) {
	const childUnit = useChildCalendarUnit(unit.childUnitId)

	if (!childUnit) {
		return null
	}

	return (
		<CalendarUnitPreviewRecursive depth={depth} unit={childUnit} label={unit.label} repeats={unit.repeats} />
	)
}
