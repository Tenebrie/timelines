import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useSearch } from '@tanstack/react-router'
import { memo, useState } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { useTimelineContextMenu } from './components/TimelineContextMenu/hooks/useTimelineContextMenu'
import { TimelineControls } from './components/TimelineControls'
import { TimelineEventListener } from './components/TimelineEventListener'
import { TimelineNavigationReporter } from './components/TimelineNavigationReporter'
import { TimelinePrePositioner } from './components/TimelinePrePositioner'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimelineZoomReporter } from './components/TimelineZoomReporter'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import { useTimelineDimensions } from './hooks/useTimelineDimensions'
import { TimelineContainer, TimelineWrapper } from './styles'
import { TimelineTracks } from './tracks/TimelineTracks'

export const Timeline = memo(TimelineComponent)

function TimelineComponent() {
	const selectedTime = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.time,
	})

	const theme = useCustomTheme()

	const [opacity, setOpacity] = useState(0)
	const { onContextMenu } = useTimelineContextMenu()
	const { containerRef, containerWidth } = useTimelineDimensions()

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	useEffectOnce(() => {
		scrollTimelineTo({ timestamp: selectedTime, skipAnim: true })
	})

	return (
		<Paper sx={{ height: '100%', borderRadius: 0, zIndex: 2 }}>
			<TimelineWrapper>
				<TimelineContainer ref={containerRef} onContextMenu={onContextMenu} $theme={theme}>
					<Box
						width={1}
						height={1}
						style={{ opacity }}
						sx={{ transition: 'opacity 0.3s', pointerEvents: 'none' }}
					>
						{opacity > 0 && (
							<>
								<TimelineTracks containerWidth={containerWidth} />
								<TimeMarker timestamp={selectedTime} />
								<TimelineScaleLabel />
								<TimelineAnchor containerWidth={containerWidth} />
							</>
						)}
					</Box>
				</TimelineContainer>
				<TimelineControls />
			</TimelineWrapper>
			<TimelineZoomReporter />
			<TimelineEventListener containerWidth={containerWidth} />
			<TimelinePrePositioner setOpacity={setOpacity} />
			<TimelineNavigationReporter ref={containerRef} containerWidth={containerWidth} />
		</Paper>
	)
}
