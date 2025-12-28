import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { LineSpacing } from '@/app/utils/constants'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineAnchorContainer } from './TimelineAnchorContainer'
import { TimelineAnchorLine } from './TimelineAnchorLine'

export const TimelineAnchorPadding = 150 // pixels
export const ResetNumbersAfterEvery = 3000000 // pixels of scrolling

type Props = {
	containerWidth: number
}

export const TimelineAnchor = memo(TimelineAnchorComponent)

function TimelineAnchorComponent({ containerWidth }: Props) {
	const theme = useCustomTheme()
	const { calendar } = useSelector(getWorldState, (a, b) => a.calendar === b.calendar)
	const { scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.scaleLevel === b.scaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel, calendar })

	const visible = !isSwitchingScale
	const lineCount = useMemo(
		() => Math.ceil(containerWidth / LineSpacing) + Math.ceil(TimelineAnchorPadding / LineSpacing) * 2,
		[containerWidth],
	)

	const [dividers, setDividers] = useState(Array(lineCount).fill(0))
	const { smallGroupSize, mediumGroupSize, largeGroupSize } = getTimelineMultipliers()

	const lastLineCount = useRef(0)
	const lastCalendar = useRef(calendar)
	const lastContainerWidth = useRef(containerWidth)
	const lastScaleLevel = useRef(scaleLevel)
	useEffect(() => {
		if (
			lineCount !== lastLineCount.current ||
			calendar !== lastCalendar.current ||
			containerWidth !== lastContainerWidth.current ||
			scaleLevel !== lastScaleLevel.current
		) {
			lastLineCount.current = lineCount
			lastCalendar.current = calendar
			lastContainerWidth.current = containerWidth
			lastScaleLevel.current = scaleLevel
			setDividers(Array(lineCount).fill(0))
		}
	}, [calendar, lineCount, containerWidth, scaleLevel])

	// TODO: Optimize Fade component being heavy?
	return (
		<Fade in={visible} appear timeout={300}>
			<Box>
				<TimelineAnchorContainer>
					{dividers.map((_, index) => (
						<TimelineAnchorLine
							key={`${index}`}
							theme={theme}
							index={index}
							lineCount={lineCount}
							scaleLevel={scaleLevel}
							smallGroupSize={smallGroupSize}
							mediumGroupSize={mediumGroupSize}
							largeGroupSize={largeGroupSize}
							scaledTimeToRealTime={scaledTimeToRealTime}
							containerWidth={containerWidth}
						/>
					))}
				</TimelineAnchorContainer>
			</Box>
		</Fade>
	)
}
