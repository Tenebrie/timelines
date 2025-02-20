import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'

import { TimelineEventHeightPx } from '../hooks/useEventTracks'
import { useHoveredTimelineMarker } from './TimelineEvent/HoveredTimelineEvents'

type Props = {
	entity: TimelineEntity<MarkerType>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export function TimelineChainHover({ entity, realTimeToScaledTime }: Props) {
	const theme = useCustomTheme()
	const color = useEntityColor({ entity })
	const { timeToLabel } = useWorldTime()
	const { hovered, lastHovered } = useHoveredTimelineMarker(entity)

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
				width: Math.max(0, dist) + 16,
				height: hovered ? 68 : 30,
				overflow: 'hidden',
				borderRadius: '0 8px 8px 0',
				transition: 'height 0.1s, width 0.1s',
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					width: 'calc(100% - 2px)',
					height: 'calc(100% - 2px)',
					background: hovered ? 'rgb(255 255 255 / 10%)' : theme.custom.palette.background.soft,
					display: 'flex',
					// boxShadow: 'inset 0 0 100px rgba(0,0,0,1)',
					opacity: dist > 1 && chainVisible ? 1 : 0,
					paddingLeft: '20px',
					borderRadius: '8px 8px 8px 0px',
					borderTop: `2px solid ${color}`,
					borderLeft: `2px solid ${color}`,
					pointerEvents: 'none',
					transition: 'height 0.3s, background 0.3s, width 0.3s, box-shadow 0.3s, color 0.3s, opacity 0.3s',
				}}
			>
				<Stack sx={{ gap: 0.5, paddingTop: 0.6, '& > *': { flexShrink: 0 }, width: 'calc(100% - 40px)' }}>
					<Typography variant="body2" sx={{ fontFamily: 'Inter' }} fontWeight={600} noWrap>
						{entity.name}
					</Typography>
					<Typography variant="caption" noWrap>
						{timeToLabel(entity.markerPosition)}
					</Typography>
				</Stack>
			</Box>
			{(hovered || lastHovered) && (
				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						left: 0,
						top: 0,
						opacity: hovered ? 1 : 0,
						backdropFilter: 'blur(8px)',
						zIndex: -1,
						transition: 'opacity 0.1s',
					}}
				/>
			)}
		</Box>
	)
}
