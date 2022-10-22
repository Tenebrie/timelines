import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldOutlinerState } from '../../selectors'
import { TimelineAnchor } from './components/TimelineAnchor/TimelineAnchor'
import { TimelineEventGroup } from './components/TimelineEventGroup/TimelineEventGroup'
import { TimelineScaleLabel } from './components/TimelineScaleLabel/TimelineScaleLabel'
import { TimeMarker } from './components/TimeMarker/TimeMarker'
import useEventGroups from './hooks/useEventGroups'
import { useTimelineNavigation } from './hooks/useTimelineNavigation'
import { TimelineContainer, TimelineWrapper } from './styles'

export const Timeline = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { selectedTime } = useSelector(getWorldOutlinerState)

	const dispatch = useDispatch()
	const { openEventWizard } = worldSlice.actions

	const { navigateToRoot, navigateToOutliner } = useWorldRouter()

	const onClick = (time: number) => {
		if (selectedTime === time) {
			navigateToRoot()
		} else {
			navigateToOutliner(time)
		}
	}

	const { scroll, timePerPixel, scaleLevel, targetScaleIndex, isSwitchingScale } = useTimelineNavigation({
		containerRef,
		defaultScroll: 150,
		maximumScroll: 500,
		scaleLimits: [-3, 10],
		onClick: (time) => onClick(time),
		onDoubleClick: (time) => dispatch(openEventWizard({ timestamp: time })),
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
				{selectedTime !== null && (
					<TimeMarker timestamp={selectedTime} timePerPixel={timePerPixel} scroll={scroll} mode="mouse" />
				)}
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
