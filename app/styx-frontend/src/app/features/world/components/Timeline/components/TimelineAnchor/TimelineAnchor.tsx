import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../../preferences/selectors'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { ScaleLevel } from '../../types'
import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorLine } from './TimelineAnchorLine'

export const TimelineAnchorPadding = 150 // pixels
export const ResetNumbersAfterEvery = 30000000 // pixels of scrolling

type Props = {
	visible: boolean
	scroll: number
	timelineScale: number
	scaleLevel: ScaleLevel
}

const TimelineAnchorComponent = ({ scroll, timelineScale, scaleLevel, visible }: Props) => {
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { parseTime, timeToShortLabel } = useWorldTime()
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel })

	const lineCount =
		Math.ceil((window.innerWidth / lineSpacing) * timelineScale) +
		Math.ceil(TimelineAnchorPadding / lineSpacing) * 2

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
