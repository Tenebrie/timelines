import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'

export type StatCardSeries = {
	label: string
	value: number
}[]

export function AdminDashboardStatCard({
	label,
	value,
	sub,
	series,
}: {
	label: string
	value: number | string
	sub?: string
	series?: StatCardSeries
}) {
	const theme = useTheme()
	return (
		<Paper
			variant="outlined"
			sx={{
				padding: '16px 20px',
				flex: '1 1 0',
				minWidth: 160,
				display: 'flex',
				flexDirection: 'column',
				gap: 0.25,
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Stack direction="row" alignItems="flex-end" gap={2}>
				<Stack>
					<Typography variant="h4" fontWeight="bold">
						{value}
					</Typography>
					{sub && (
						<Typography variant="caption" color="text.secondary">
							{sub}
						</Typography>
					)}
				</Stack>
				{series && (
					<Box flex={1} minWidth={0}>
						<SparkLineChart
							data={series.map((point) => point.value)}
							xAxis={{ data: series.map((point) => point.label) }}
							height={48}
							area
							curve="monotoneX"
							color={theme.palette.primary.main}
							showTooltip
							showHighlight
							margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
							sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.15 } }}
						/>
					</Box>
				)}
			</Stack>
		</Paper>
	)
}
