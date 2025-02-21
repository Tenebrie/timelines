import Fade from '@mui/material/Fade'
import { memo, Profiler, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState, getWorldState } from '@/app/features/world/selectors'
import { LineSpacing } from '@/app/features/worldTimeline/utils/constants'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { TimelineAnchorContainer, TimelineSmallestPips } from './styles'
import { getLoop, TimelineAnchorLine } from './TimelineAnchorLine'

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
	const { parseTime, timeToShortLabel } = useWorldTime()
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel, calendar })

	// TODO: Hard optimize this to avoid rerender here
	const [scroll, setScroll] = useState(0)
	useEventBusSubscribe({ event: 'timelineScrolled', callback: ({ newScroll }) => setScroll(newScroll) })

	const visible = !isSwitchingScale
	const lineCount = useMemo(
		() => Math.ceil(containerWidth / LineSpacing) + Math.ceil(TimelineAnchorPadding / LineSpacing) * 2,
		[containerWidth],
	)
	const dividers = useRef(
		Array(lineCount).fill({
			index: -1,
			scaleLevel: -1,
			isRendered: false,
			isSmallGroup: false,
			isMediumGroup: false,
			isLargeGroup: false,
		}),
	)
	const [renderedDividers, setRenderedDividers] = useState(dividers.current)
	const { smallGroupSize, mediumGroupSize, largeGroupSize } = getTimelineMultipliers()

	const updateDividers = useCallback(() => {
		dividers.current = dividers.current.map((oldData, rawIndex) => {
			const loopIndex = getLoop({
				index: rawIndex,
				lineCount,
				timelineScroll: scroll,
			})
			const index = rawIndex + loopIndex * lineCount
			if (oldData.index === index && oldData.scaleLevel === scaleLevel) {
				return oldData
			}
			const parsedTime = parseTime(scaledTimeToRealTime(index * LineSpacing))
			const isStartOfMonth = () => {
				return parsedTime.monthDay === 1 && parsedTime.hour === 0 && parsedTime.minute === 0
			}

			const isStartOfYear = () => {
				return (
					parsedTime.monthIndex === 0 &&
					parsedTime.day === 1 &&
					parsedTime.hour === 0 &&
					parsedTime.minute === 0
				)
			}

			const isSmallGroup = index % smallGroupSize === 0
			const isMediumGroup =
				(isSmallGroup && index % mediumGroupSize === 0) ||
				(scaleLevel === 2 && isStartOfMonth()) ||
				(scaleLevel === 3 && isStartOfMonth())
			const isLargeGroup =
				isMediumGroup &&
				(index % largeGroupSize === 0 ||
					(scaleLevel === 1 && isStartOfMonth()) ||
					(scaleLevel === 2 && isStartOfYear()) ||
					(scaleLevel === 3 && isStartOfYear()))
			return {
				index,
				scaleLevel,
				isRendered: isSmallGroup || isMediumGroup || isLargeGroup,
				isSmallGroup,
				isMediumGroup,
				isLargeGroup,
			}
		})
		setRenderedDividers(dividers.current)
	}, [
		largeGroupSize,
		lineCount,
		mediumGroupSize,
		parseTime,
		scaleLevel,
		scaledTimeToRealTime,
		scroll,
		smallGroupSize,
	])

	const lastLineCount = useRef(0)
	const lastCalendar = useRef(calendar)
	useEffect(() => {
		if (lineCount !== lastLineCount.current || calendar !== lastCalendar.current) {
			lastLineCount.current = lineCount
			dividers.current = Array(lineCount).fill({
				index: -1,
				lineCount: -1,
				scaleLevel: -1,
				isRendered: false,
				isSmallGroup: false,
				isMediumGroup: false,
				isLargeGroup: false,
			})
		}
		startTransition(() => {
			updateDividers()
		})
	}, [calendar, lineCount, updateDividers])

	const positionNormalizer = useMemo(
		() => Math.floor(Math.abs(scroll) / ResetNumbersAfterEvery) * ResetNumbersAfterEvery * Math.sign(scroll),
		[scroll],
	)

	// TODO: Optimize Fade component being heavy?
	return (
		<Profiler id="TimelineAnchor" onRender={reportComponentProfile}>
			<Fade in={visible} appear timeout={300}>
				<TimelineAnchorContainer offset={scroll % ResetNumbersAfterEvery}>
					<TimelineSmallestPips offset={scroll % ResetNumbersAfterEvery} $lineSpacing={LineSpacing} />
					{renderedDividers.map((data, index) => (
						<div key={index}>
							{data.isRendered && (
								<TimelineAnchorLine
									key={`${index}`}
									theme={theme}
									index={index}
									visible={visible}
									lineCount={lineCount}
									scaleLevel={scaleLevel}
									timelineScroll={scroll}
									timeToShortLabel={timeToShortLabel}
									scaledTimeToRealTime={scaledTimeToRealTime}
									positionNormalizer={positionNormalizer}
									{...data}
								/>
							)}
						</div>
					))}
				</TimelineAnchorContainer>
			</Fade>
		</Profiler>
	)
}
