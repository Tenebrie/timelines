import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo } from 'react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'

type Props = {
	entity: TimelineEntity<MarkerType>
}

export const TimelineChainBody = memo(TimelineChainBodyComponent)

function TimelineChainBodyComponent({ entity }: Props) {
	const theme = useCustomTheme()
	const color = useEntityColor({ id: entity.eventId, color: entity.color })

	const chainVisible = entity.markerType === 'issuedAt' || entity.markerType === 'deltaState'
	const chainMarker = !!entity.chainEntity
	const rightBorder = !chainMarker
	const height = TimelineEventHeightPx * entity.markerHeight + 4

	return (
		<Box
			data-testid="TimelineMarkerChain"
			sx={{
				position: 'absolute',
				left: TimelineEventHeightPx / 2 + 24,
				bottom: height,
				width: 'var(--anchor-length)',
				height: 30,
				overflow: 'hidden',
				transform: `translateX(var(--align-offset))`,
				pointerEvents: 'none',
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
					opacity: chainVisible ? 1 : 0,
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
