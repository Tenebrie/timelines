import Edit from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import type { RecentActivity } from '../hooks/useRecentActivity'
import { formatTimeAgo } from '../utils/formatTimeAgo'

type ActivityItemProps = {
	activity: RecentActivity
}

export function ActivityItem({ activity }: ActivityItemProps) {
	const navigate = useStableNavigate()

	const handleClick = () => {
		if (activity.type === 'world') {
			navigate({
				to: '/world/$worldId/timeline',
				params: { worldId: activity.id },
			})
		} else {
			navigate({
				to: '/calendar/$calendarId',
				params: { calendarId: activity.id },
			})
		}
	}

	return (
		<ButtonBase
			onClick={handleClick}
			sx={{
				width: '100%',
				textAlign: 'left',
				borderRadius: 1,
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				gap={2}
				sx={{
					p: 1.5,
					borderRadius: 1,
					width: '100%',
					'&:hover': {
						bgcolor: 'action.hover',
					},
				}}
			>
				<Box
					sx={{
						p: 1,
						borderRadius: 1,
						bgcolor: activity.type === 'world' ? 'info.main' : 'success.main',
						color: 'white',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Edit fontSize="small" />
				</Box>
				<Box flex={1}>
					<Typography variant="body2" fontWeight="medium">
						{activity.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{activity.type === 'world' ? 'World' : 'Calendar'} updated
					</Typography>
				</Box>
				<Typography variant="caption" color="text.secondary">
					{formatTimeAgo(activity.updatedAt)}
				</Typography>
			</Stack>
		</ButtonBase>
	)
}
