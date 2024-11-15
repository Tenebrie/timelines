import { memo, useMemo } from 'react'

import { useCustomTheme } from '../../../../../../../hooks/useCustomTheme'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { ScaleLevel } from '../../types'
import { TimelineAnchorContainer, TimelineSmallestPips } from './styles'
import { getLoop, TimelineAnchorLine } from './TimelineAnchorLine'

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

	const { smallGroupSize, mediumGroupSize, largeGroupSize } = getTimelineMultipliers()
	const dividers = useMemo(
		() =>
			Array(lineCount)
				.fill(null)
				.map((_, rawIndex) => {
					const loopIndex = getLoop({
						index: rawIndex,
						lineCount,
						lineSpacing,
						timelineScroll: scroll,
					})
					const index = rawIndex + loopIndex * lineCount
					const parsedTime = parseTime(scaledTimeToRealTime(index * lineSpacing))
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
						isRendered: isSmallGroup || isMediumGroup || isLargeGroup,
						isSmallGroup,
						isMediumGroup,
						isLargeGroup,
					}
				}),
		[
			largeGroupSize,
			lineCount,
			lineSpacing,
			mediumGroupSize,
			parseTime,
			scaleLevel,
			scaledTimeToRealTime,
			scroll,
			smallGroupSize,
		],
	)

	const positionNormalizer = useMemo(
		() => Math.floor(Math.abs(scroll) / ResetNumbersAfterEvery) * ResetNumbersAfterEvery * Math.sign(scroll),
		[scroll],
	)

	return (
		<TimelineAnchorContainer offset={scroll % ResetNumbersAfterEvery}>
			<TimelineSmallestPips
				offset={scroll % ResetNumbersAfterEvery}
				$visible={visible}
				$lineSpacing={lineSpacing}
			/>
			{dividers.map((data, index) => (
				<div key={index}>
					{data.isRendered && (
						<TimelineAnchorLine
							key={`${index}`}
							theme={theme}
							index={index}
							visible={visible}
							lineCount={lineCount}
							lineSpacing={lineSpacing}
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
	)
}

export const TimelineAnchor = memo(TimelineAnchorComponent)
