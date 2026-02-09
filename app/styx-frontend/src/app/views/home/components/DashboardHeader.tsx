import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function DashboardHeader() {
	return (
		<Box>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Dashboard
			</Typography>
			<Typography variant="body1" color="text.secondary">
				Welcome back! Here&apos;s an overview of your creative universe.
			</Typography>
		</Box>
	)
}
