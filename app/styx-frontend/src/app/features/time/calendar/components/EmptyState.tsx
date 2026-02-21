import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type Props = {
	hasUnits: boolean
}

export function EmptyState({ hasUnits }: Props) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
			<Typography color="text.secondary">
				{hasUnits ? 'Select a unit from the sidebar to edit' : 'Create a time unit to get started'}
			</Typography>
		</Box>
	)
}
