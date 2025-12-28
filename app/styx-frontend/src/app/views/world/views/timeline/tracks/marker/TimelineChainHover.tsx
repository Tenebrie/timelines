import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'

type Props = {
	entity: TimelineEntity<MarkerType>
	realTimeToScaledTime: ReturnType<typeof useTimelineWorldTime>['realTimeToScaledTime']
}

export function TimelineChainHover({ entity, realTimeToScaledTime }: Props) {
	const theme = useCustomTheme()
	const color = useEntityColor({ entity })

	const rawDist = (() => {
		if (entity.chainEntity) {
			return realTimeToScaledTime(entity.chainEntity.markerPosition - entity.markerPosition)
		}
		return 0
	})()

	const dist = (() => {
		if (entity.markerType === 'revokedAt') {
			return 0
		}
		return rawDist - TimelineEventHeightPx + 13
	})()

	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState'
	const chainMarker = !!entity.chainEntity
	const rightBorder = !chainMarker

	return (
		<Box
			data-testid="TimelineMarkerChain"
			sx={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: Math.max(0, dist) + (dist > 16 ? 16 : 0),
				height: 30,
				overflow: 'hidden',
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					width: `calc(100% - 24px - ${rightBorder ? 0 : 10}px)`,
					height: 'calc(100% - 2px)',
					paddingRight: '-8px',
					background: theme.custom.palette.background.timelineMarkerTail,
					display: 'flex',
					opacity: dist > 1 && chainVisible ? 1 : 0,
					paddingLeft: '20px',
					borderRadius: `8px ${rightBorder ? 8 : 0}px ${rightBorder ? 8 : 2}px 0px`,
					borderTop: `2px solid ${color}`,
					borderLeft: `2px solid ${color}`,
					borderRight: `2px solid ${color}`,
					pointerEvents: 'none',
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
				</Stack>
			</Box>
		</Box>
	)
}
