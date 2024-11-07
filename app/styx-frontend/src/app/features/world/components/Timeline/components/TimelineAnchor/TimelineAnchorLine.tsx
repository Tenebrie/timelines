import { memo, useCallback, useMemo } from 'react'

import { CustomTheme } from '../../../../../../../hooks/useCustomTheme'
import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { ScaleLevel } from '../../types'
import { Divider, DividerContainer, DividerLabel } from './styles'
import { TimelineAnchorPadding } from './TimelineAnchor'

const getPixelsPerLoop = ({ lineCount, lineSpacing }: { lineCount: number; lineSpacing: number }) =>
	lineCount * lineSpacing

const getLoop = ({
	index,
	lineCount,
	timelineScale,
	lineSpacing,
	timelineScroll,
}: {
	index: number
	lineCount: number
	lineSpacing: number
	timelineScale: number
	timelineScroll: number
}) =>
	-Math.floor(
		(index * lineSpacing + timelineScroll * timelineScale + TimelineAnchorPadding) /
			getPixelsPerLoop({ lineCount, lineSpacing }),
	)

type Props = {
	// Theme to use for styling
	theme: CustomTheme
	// Raw index of the anchor line
	index: number
	// Total number of the anchor lines
	lineCount: number
	// Current zoom scalar
	timelineScale: number
	// User-specified preference of pixels per line on screen
	lineSpacing: number
	// Current level of scale
	scaleLevel: ScaleLevel
	// Set to 'false' while switching scales
	visible: boolean
	// Horizontal scroll of the entire timeline in pixels (offset)
	timelineScroll: number
	// An offset added to divider position to counteract number overflow on far scrolling
	positionNormalizer: number
	parseTime: ReturnType<typeof useWorldTime>['parseTime']
	timeToShortLabel: ReturnType<typeof useWorldTime>['timeToShortLabel']
	scaledTimeToRealTime: ReturnType<typeof useTimelineWorldTime>['scaledTimeToRealTime']
	getTimelineMultipliers: ReturnType<typeof useTimelineWorldTime>['getTimelineMultipliers']
}

const TimelineAnchorLineComponent = (props: Props) => {
	const {
		theme,
		index: rawIndex,
		lineCount,
		timelineScale,
		lineSpacing,
		scaleLevel,
		visible,
		timelineScroll,
		positionNormalizer,
		parseTime,
		timeToShortLabel,
		scaledTimeToRealTime,
		getTimelineMultipliers,
	} = props

	const loopIndex = useMemo(
		() =>
			getLoop({
				index: rawIndex,
				lineCount,
				timelineScale,
				lineSpacing,
				timelineScroll,
			}),
		[lineCount, lineSpacing, rawIndex, timelineScale, timelineScroll],
	)
	const loopOffset = useMemo(
		() => loopIndex * getPixelsPerLoop({ lineCount, lineSpacing }),
		[lineCount, lineSpacing, loopIndex],
	)
	const dividerPosition = useMemo(
		() => Math.round(((rawIndex * lineSpacing) / 1 + loopOffset) / timelineScale) + positionNormalizer,
		[lineSpacing, loopOffset, positionNormalizer, rawIndex, timelineScale],
	)

	const { largeGroupSize, mediumGroupSize, smallGroupSize } = getTimelineMultipliers()

	const index = useMemo(() => rawIndex + loopIndex * lineCount, [lineCount, loopIndex, rawIndex])

	const { isSmallGroup, isMediumGroup, isLargeGroup } = useMemo(() => {
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
			isSmallGroup,
			isMediumGroup,
			isLargeGroup,
		}
	}, [
		index,
		largeGroupSize,
		lineSpacing,
		mediumGroupSize,
		parseTime,
		scaleLevel,
		scaledTimeToRealTime,
		smallGroupSize,
	])

	const labelSize = useMemo(() => {
		if (isLargeGroup) {
			return 'large'
		}
		if (isMediumGroup) {
			return 'medium'
		}
		if (
			isSmallGroup &&
			(timelineScale <= 0.5 ||
				scaleLevel === 3 ||
				(timelineScale <= 1 && scaleLevel === 2) ||
				(timelineScale <= 1 && scaleLevel === 4) ||
				(timelineScale <= 1 && scaleLevel === 5) ||
				scaleLevel === 6 ||
				scaleLevel === 7)
		) {
			return 'small'
		}

		return null
	}, [isLargeGroup, isMediumGroup, isSmallGroup, scaleLevel, timelineScale])

	const getLineColor = useCallback(() => {
		if (!isMediumGroup && !isLargeGroup) {
			if (scaleLevel === 0) {
				return '#999'
			} else if (scaleLevel === 1) {
				return '#797'
			} else if (scaleLevel === 2) {
				return '#979'
			} else if (scaleLevel === 3) {
				return '#799'
			} else if (scaleLevel === 4) {
				return '#A9A'
			} else if (scaleLevel === 5) {
				return '#9AA'
			} else if (scaleLevel === 6) {
				return '#797'
			} else if (scaleLevel === 7) {
				return '#979'
			}
		}

		const groupColors = [
			'#63ffc8',
			'#ffd026',
			'#57fd20',
			'#EAADE9',
			'#ff6363',
			'#f9a7f7',
			'#f9c2a7',
			'#63ffc8',
			'#ffd026',
		]
		if (isLargeGroup) {
			return groupColors[scaleLevel + 1]
		} else if (isMediumGroup) {
			return groupColors[scaleLevel - 0]
		} else if (isSmallGroup) {
			return groupColors[scaleLevel - 1]
		}

		return 'gray'
	}, [isLargeGroup, isMediumGroup, isSmallGroup, scaleLevel])

	const getDividerHeight = useCallback(() => {
		if (isLargeGroup) {
			return 2.5
		} else if (isMediumGroup) {
			return 2
		} else if (isSmallGroup) {
			return 1.5
		}
		return 1
	}, [isLargeGroup, isMediumGroup, isSmallGroup])

	const lineColor = useMemo(getLineColor, [getLineColor])
	const dividerHeight = useMemo(getDividerHeight, [getDividerHeight])

	return (
		<DividerContainer key={rawIndex} offset={dividerPosition} className={visible ? 'visible' : ''}>
			{!!labelSize && (
				<DividerLabel
					$theme={theme}
					style={{
						fontWeight: labelSize === 'large' ? 600 : labelSize === 'medium' ? 600 : 400,
					}}
				>
					{timeToShortLabel(scaledTimeToRealTime(index * lineSpacing), scaleLevel, labelSize)}
				</DividerLabel>
			)}
			<Divider color={lineColor} height={dividerHeight} />
		</DividerContainer>
	)
}

export const TimelineAnchorLine = memo(
	TimelineAnchorLineComponent,
	(a, b) =>
		getLoop(a) === getLoop(b) &&
		a.theme === b.theme &&
		a.timelineScale === b.timelineScale &&
		a.visible === b.visible &&
		a.lineSpacing === b.lineSpacing &&
		a.positionNormalizer === b.positionNormalizer &&
		a.timeToShortLabel === b.timeToShortLabel,
)
