import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { formatBytes } from '@/app/utils/formatBytes'

export function AdminDashboardStorageCard({
	label,
	free,
	total,
}: {
	label: string
	free: number
	total: number
}) {
	const used = total - free
	const usedPercent = total > 0 ? (used / total) * 100 : 0
	const color = usedPercent > 90 ? 'error' : usedPercent > 75 ? 'warning' : 'primary'

	return (
		<Paper
			variant="outlined"
			sx={{
				padding: '16px 20px',
				flex: '1 1 0',
				minWidth: 200,
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<LinearProgress
				variant="determinate"
				value={usedPercent}
				color={color}
				sx={{ height: 8, borderRadius: 4 }}
			/>
			<Stack direction="row" justifyContent="space-between">
				<Typography variant="caption" color="text.secondary">
					{formatBytes(used)} used of {formatBytes(total)}
				</Typography>
				<Typography variant="caption" fontWeight={600} color={`${color}.main`}>
					{usedPercent.toFixed(1)}%
				</Typography>
			</Stack>
		</Paper>
	)
}
