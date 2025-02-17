import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { memo, Profiler } from 'react'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'

type Props = {
	entity: TimelineEntity<MarkerType>
	edited: boolean
	selected: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export const TimelineChainComponent = ({ entity, realTimeToScaledTime }: Props) => {
	const theme = useCustomTheme()
	const color = useEntityColor({ entity })
	const rawDist = (() => {
		if (entity.chainEntity) {
			return realTimeToScaledTime(entity.chainEntity.markerPosition - entity.markerPosition)
		}
		if (entity.followingEntity) {
			return Math.min(
				200,
				realTimeToScaledTime(entity.followingEntity.markerPosition - entity.markerPosition) - 25,
			)
		}
		return 200
	})()
	const dist = rawDist - TimelineEventHeightPx + 13
	const height = TimelineEventHeightPx * entity.markerHeight + 4
	if (dist < 1) {
		return null
	}

	return (
		<Profiler id="TimelineChain" onRender={reportComponentProfile}>
			<Box
				style={{
					bottom: height,
					left: TimelineEventHeightPx / 2 - 16,
				}}
				sx={{
					pointerEvents: 'none',
					position: 'absolute',
				}}
			>
				<Box
					style={{
						width: dist,
						height: TimelineEventHeightPx - 12,
						borderTopColor: color,
					}}
					sx={{
						display: 'flex',
						alignItems: 'center',
						paddingLeft: '20px',
						paddingRight: 0,
						borderRadius: '8px',
						borderTop: `2px solid ${color}`,
						background: theme.custom.palette.background.soft,
					}}
				>
					<Typography
						variant="caption"
						fontWeight={800}
						noWrap
						style={{ width: 'calc(100% - 8px)', overflowY: 'visible' }}
					>
						{entity.name}
					</Typography>
				</Box>
			</Box>
		</Profiler>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
