import { CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type Props = {
	child: CalendarDraftUnitChildRelation
	index: number
	name: string
}

export function CalendarUnitChildListItemGhost({ child, name, index }: Props) {
	const hasLabels = child.label || child.shortLabel
	const displayText = hasLabels
		? child.shortLabel
			? `${child.label ?? ''} (${child.shortLabel})`
			: child.label
		: ''

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				p: 1,
				bgcolor: 'action.selected',
				borderRadius: 1,
				opacity: 0.8,
				width: '500px',
			}}
		>
			<Typography color="text.secondary" variant="body2" sx={{ minWidth: 30 }}>
				{index + 1}.
			</Typography>
			<Typography
				variant="body2"
				color={'text.primary'}
				sx={{ fontStyle: hasLabels ? 'normal' : 'italic', flex: 1 }}
			>
				{name} x{child.repeats}
				{displayText ? `: ${displayText}` : ''}
			</Typography>
		</Box>
	)
}
