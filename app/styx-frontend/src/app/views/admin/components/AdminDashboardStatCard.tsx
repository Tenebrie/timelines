import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

export function AdminDashboardStatCard({
	label,
	value,
	sub,
}: {
	label: string
	value: number | string
	sub?: string
}) {
	return (
		<Paper
			variant="outlined"
			sx={{
				padding: '16px 20px',
				flex: '1 1 0',
				minWidth: 120,
				display: 'flex',
				flexDirection: 'column',
				gap: 0.25,
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="h4" fontWeight="bold">
				{value}
			</Typography>
			{sub && (
				<Typography variant="caption" color="text.secondary">
					{sub}
				</Typography>
			)}
		</Paper>
	)
}
