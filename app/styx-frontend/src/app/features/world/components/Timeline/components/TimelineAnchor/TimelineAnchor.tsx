import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../../preferences/selectors'
import { ScaleLevel } from '../../types'
import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorLine } from './TimelineAnchorLine'

export const TimelineAnchorPadding = 50 // pixels

type Props = {
	visible: boolean
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
}

export const TimelineAnchor = ({ scroll, timelineScale, scaleLevel, visible }: Props) => {
	const { lineSpacing } = useSelector(getTimelinePreferences)

	const lineCount =
		Math.ceil((window.screen.width / lineSpacing) * timelineScale) +
		Math.ceil(TimelineAnchorPadding / lineSpacing) * 2

	const dividers = Array(lineCount).fill(null)

	return (
		<TimelineAnchorContainer offset={scroll}>
			{dividers.map((_, index) => (
				<TimelineAnchorLine
					key={`${index}`}
					index={index}
					visible={visible}
					lineCount={lineCount}
					lineSpacing={lineSpacing}
					timelineScale={timelineScale}
					scaleLevel={scaleLevel}
					timelineScroll={scroll}
				/>
			))}
		</TimelineAnchorContainer>
	)
}
