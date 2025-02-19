import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'

type Props = {
	entity: TimelineEntity<MarkerType>
	hovered: boolean
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export function TimelineChainHover({ entity, hovered, realTimeToScaledTime }: Props) {
	const theme = useCustomTheme()
	const color = useEntityColor({ entity })
	const { timeToLabel } = useWorldTime()

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

	const dist = (() => {
		if (hovered) {
			return 300
		}
		return rawDist - TimelineEventHeightPx + 13
	})()

	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState' || hovered

	return (
		<Box
			sx={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: Math.max(0, dist),
				height: hovered ? 68 : 28,
				background: !hovered
					? theme.custom.palette.background.soft
					: theme.custom.palette.background.hardInvert,
				display: 'flex',
				opacity: dist > 1 && chainVisible ? 1 : 0,
				paddingLeft: '18px',
				paddingRight: 0,
				borderRadius: '8px 8px 8px 0px',
				borderTop: `2px solid ${color}`,
				borderLeft: `2px solid ${color}`,
				pointerEvents: 'none',
				overflowX: 'hidden',
				transition: 'height 0.3s, opacity 0.3s, background 0.3s, width 0.3s',
			}}
		>
			<Stack sx={{ gap: 0.5, paddingTop: 0.5, overflowY: 'hidden', '& > *': { flexShrink: 0 } }}>
				<Typography variant="caption" fontWeight={800} noWrap>
					{entity.name}
				</Typography>
				<Typography variant="caption" fontWeight={800} noWrap>
					{timeToLabel(entity.markerPosition)}
				</Typography>
			</Stack>
		</Box>
	)
}
