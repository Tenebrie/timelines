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
			<div
				style={{
					pointerEvents: 'none',
					position: 'absolute',
					bottom: height,
					left: TimelineEventHeightPx / 2 - 16,
				}}
			>
				<div
					style={{
						width: dist,
						height: TimelineEventHeightPx - 12,
						background: theme.custom.palette.background.soft,
						borderTop: `2px solid ${color}`,
						display: 'flex',
						alignItems: 'center',
						paddingLeft: 20,
						paddingRight: 0,
						borderRadius: 8,
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
				</div>
			</div>
		</Profiler>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
