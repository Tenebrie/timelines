import { useRef } from 'react'

import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { TimelineContainer } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { scroll, timePerPixel, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef,
		defaultScroll: 150,
		scaleLimits: [-3, 10],
	})
	const eventGroups = useEventGroups(timePerPixel)

	return (
		<TimelineContainer ref={containerRef}>
			<TimelineScaleLabel targetScaleIndex={targetScaleIndex} visible={isSwitchingScale} />
			<TimelineAnchor
				visible={!isSwitchingScale}
				scroll={scroll}
				timePerPixel={timePerPixel}
				scaleLevel={scaleLevel}
			/>
			{eventGroups.map((group) => (
				<TimelineEventGroup
					key={group.timestamp}
					visible={!isSwitchingScale}
					scroll={scroll}
					eventGroup={group}
					pixelsPerTime={timePerPixel}
				/>
			))}
		</TimelineContainer>
	)
}
