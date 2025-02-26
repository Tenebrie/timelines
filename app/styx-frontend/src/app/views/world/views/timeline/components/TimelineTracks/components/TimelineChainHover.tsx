import { MarkerType, TimelineEntity } from '@api/types/types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useCustomTheme } from '@/app/features/theming/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
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
				350,
				realTimeToScaledTime(entity.followingEntity.markerPosition - entity.markerPosition) - 25,
			)
		}
		return 350
	})()

	const dist = (() => {
		if (hovered) {
			return 300
		}
		if (entity.markerType === 'revokedAt') {
			return 0
		}
		return rawDist - TimelineEventHeightPx + 13
	})()

	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState' || hovered
	const chainMarker = !!entity.chainEntity
	const rightBorder = !chainMarker || hovered

	return (
		<Box
			data-testid="TimelineMarkerChain"
			sx={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: Math.max(0, dist) + (dist > 16 ? 16 : 0),
				height: hovered ? 54 : 30,
				overflow: 'hidden',
				transition: 'height 0.3s, width 0.3s',
				transitionDelay: hovered ? '0.4s' : '0s',
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					width: `calc(100% - 24px - ${rightBorder ? 0 : 10}px)`,
					height: 'calc(100% - 2px)',
					paddingRight: '-8px',
					background: theme.custom.palette.background.soft,
					display: 'flex',
					opacity: dist > 1 && chainVisible ? 1 : 0,
					paddingLeft: '20px',
					borderRadius: `8px ${rightBorder ? 8 : 0}px ${rightBorder ? 8 : 2}px 0px`,
					borderTop: `2px solid ${color}`,
					borderLeft: `2px solid ${color}`,
					borderRight: `2px solid ${color}`,
					pointerEvents: 'none',
					transition: 'width 0.3s, border-radius 0.3s, background 0.3s, opacity 0.3s',
					transitionDelay: hovered ? '0.4s' : '0s',
				}}
			>
				<Stack
					sx={{
						gap: 0.5,
						paddingTop: 0.4,
						// TODO: Optimize this
						'& > *': { flexShrink: 0 },
						width: 'calc(100% - 8px)',
					}}
				>
					<Typography variant="body2" sx={{ fontFamily: 'Inter' }} fontWeight={600} noWrap>
						{entity.name}
					</Typography>
					{hovered ||
						(lastHovered && (
							<Typography variant="caption" noWrap>
								{timeToLabel(entity.markerPosition)}
							</Typography>
						))}
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
						transition: 'opacity 0.3s',
						transitionDelay: hovered ? '0.4s' : '0s',
					}}
				/>
			)}
		</Box>
	)
}
