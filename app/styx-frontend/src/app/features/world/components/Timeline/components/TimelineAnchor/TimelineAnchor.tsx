import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { ScaleLevel } from '../../types'
import { TimelineScroll } from '../../utils/TimelineScroll'
import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorLine } from './TimelineAnchorLine'

export const TimelineAnchorPadding = 150 // pixels
export const ResetNumbersAfterEvery = 3000000 // pixels of scrolling

type Props = {
	visible: boolean
	scroll: number
	lineSpacing: number
	timelineScale: number
	scaleLevel: ScaleLevel
	containerWidth: number
}

const TimelineAnchorComponent = ({
	lineSpacing,
	timelineScale,
	scaleLevel,
	visible,
	scroll,
	containerWidth,
}: Props) => {
	const { parseTime, timeToShortLabel } = useWorldTime()
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel })

	const lineCount = useMemo(
		() =>
			Math.ceil((containerWidth / lineSpacing) * timelineScale) +
			Math.ceil(TimelineAnchorPadding / lineSpacing) * 2,
		[containerWidth, lineSpacing, timelineScale],
	)

	const lastSeenScroll = useRef(0)
	const [scroll2, setScroll] = useState(0)

	useEffect(() => {
		const timeout = window.setInterval(() => {
			if (lastSeenScroll.current !== TimelineScroll.current) {
				lastSeenScroll.current = TimelineScroll.current
				setScroll(TimelineScroll.current)
			}
		}, 2)
		return () => {
			window.clearInterval(timeout)
		}
	}, [])

	const dividers = useMemo(() => Array(lineCount).fill(null), [lineCount])

	return (
		<TimelineAnchorContainer offset={scroll % ResetNumbersAfterEvery}>
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
					parseTime={parseTime}
					timeToShortLabel={timeToShortLabel}
					scaledTimeToRealTime={scaledTimeToRealTime}
					getTimelineMultipliers={getTimelineMultipliers}
					positionNormalizer={
						Math.floor(Math.abs(scroll) / ResetNumbersAfterEvery) * ResetNumbersAfterEvery * Math.sign(scroll)
					}
				/>
			))}
		</TimelineAnchorContainer>
	)
}

export const TimelineAnchor = memo(TimelineAnchorComponent)
