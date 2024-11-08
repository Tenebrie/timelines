import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { useCustomTheme } from '../../../../../../../hooks/useCustomTheme'
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
	scaleLevel: ScaleLevel
	containerWidth: number
}

const TimelineAnchorComponent = ({ lineSpacing, scaleLevel, scroll, visible, containerWidth }: Props) => {
	const theme = useCustomTheme()
	const { parseTime, timeToShortLabel } = useWorldTime()
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel })

	const lineCount = useMemo(
		() => Math.ceil(containerWidth / lineSpacing) + Math.ceil(TimelineAnchorPadding / lineSpacing) * 2,
		[containerWidth, lineSpacing],
	)

	const lastSeenScroll = useRef(0)
	const [scroll2, setScroll] = useState(0)

	useEffect(() => {
		const timeout = window.setInterval(() => {
			if (lastSeenScroll.current !== TimelineScroll.current) {
				lastSeenScroll.current = TimelineScroll.current
				setScroll(TimelineScroll.current)
			}
		}, 10)
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
					theme={theme}
					index={index}
					visible={visible}
					lineCount={lineCount}
					lineSpacing={lineSpacing}
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
