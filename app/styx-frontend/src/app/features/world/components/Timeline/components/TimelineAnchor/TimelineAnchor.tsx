import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../../preferences/selectors'
import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorLine } from './TimelineAnchorLine'

type Props = {
	visible: boolean
	scroll: number
	timePerPixel: number
	scaleLevel: number
}

export const TimelineAnchor = ({ scroll, timePerPixel, scaleLevel, visible }: Props) => {
	const { pixelsPerLine } = useSelector(getTimelinePreferences)

	const lineCount = Math.ceil(((window.screen.width / pixelsPerLine) * scaleLevel * timePerPixel) / 25) * 25

	const dividers = Array(lineCount).fill(null)

	return (
		<TimelineAnchorContainer offset={scroll}>
			{dividers.map((_, index) => (
				<TimelineAnchorLine
					key={`${index}`}
					index={index}
					visible={visible}
					lineCount={lineCount}
					pixelsPerLine={pixelsPerLine}
					timePerPixel={timePerPixel}
					scaleLevel={scaleLevel}
					timelineScroll={scroll}
				/>
			))}
		</TimelineAnchorContainer>
	)
}
