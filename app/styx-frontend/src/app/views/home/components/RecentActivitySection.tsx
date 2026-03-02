import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { RecentActivity } from '../hooks/useRecentActivity'
import { ActivityItem } from './ActivityItem'

type RecentActivitySectionProps = {
	activities: RecentActivity[]
}

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
	return (
		<Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom>
				Recent Activity
			</Typography>
			<Divider sx={{ mb: 2 }} />
			{activities.length > 0 ? (
				<Stack gap={0.5}>
					{activities.map((activity) => (
						<ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
					))}
				</Stack>
			) : (
				<Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
					No recent activity. Create your first world or calendar to get started!
				</Typography>
			)}
		</Paper>
	)
}
