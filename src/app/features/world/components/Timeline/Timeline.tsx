import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { worldSlice } from '../../reducer'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const dispatch = useDispatch()
	const { setSelectedOutlinerTime } = worldSlice.actions

	const containerRef = useRef<HTMLDivElement | null>(null)

	const { scroll, timePerPixel, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef,
		defaultScroll: 150,
		maximumScroll: 500,
		scaleLimits: [-3, 10],
		onSelectTime: (time) => dispatch(setSelectedOutlinerTime(time)),
	})
	const eventGroups = useEventGroups(timePerPixel)

	return (
		<TimelineWrapper>
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
						timePerPixel={timePerPixel}
					/>
				))}
			</TimelineContainer>
		</TimelineWrapper>
	)
}
