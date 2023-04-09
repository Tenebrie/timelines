import { memo, useCallback, useMemo } from 'react'

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
			getPixelsPerLoop({ lineCount, lineSpacing })
	)

type Props = {
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
	timeToShortLabel: ReturnType<typeof useWorldTime>['timeToShortLabel']
	scaledTimeToRealTime: ReturnType<typeof useTimelineWorldTime>['scaledTimeToRealTime']
	getTimelineMultipliers: ReturnType<typeof useTimelineWorldTime>['getTimelineMultipliers']
}

const TimelineAnchorLineComponent = (props: Props) => {
	const {
		index: rawIndex,
		lineCount,
		timelineScale,
		lineSpacing,
		scaleLevel,
		visible,
		timelineScroll,
		positionNormalizer,
		timeToShortLabel,
		scaledTimeToRealTime,
		getTimelineMultipliers,
	} = props

	const loopIndex = getLoop({
		index: rawIndex,
		lineCount,
		timelineScale,
		lineSpacing,
		timelineScroll,
	})
	const loopOffset = loopIndex * getPixelsPerLoop({ lineCount, lineSpacing })
	const dividerPosition =
		Math.round(((rawIndex * lineSpacing) / 1 + loopOffset) / timelineScale) + positionNormalizer

	const { largeGroupSize, mediumGroupSize, smallGroupSize } = getTimelineMultipliers()

	const index = rawIndex + loopIndex * lineCount
	const labelDisplayed =
		index % largeGroupSize === 0 ||
		(timelineScale <= 0.5 && index % mediumGroupSize === 0) ||
		(timelineScale <= 0.25 && index % smallGroupSize === 0)

	const getLineColor = useCallback(() => {
		if (Math.abs(index % mediumGroupSize) > 0) {
			if (scaleLevel === 0) {
				return '#999'
			} else if (scaleLevel === 1) {
				return '#977'
			} else if (scaleLevel === 2) {
				return '#997'
			} else if (scaleLevel === 3) {
				return '#799'
			}
		}

		const groupColors = ['#63ffc8', '#ffd026', '#ff6363', '#EAADE9', '#E9EAAD']
		if (index % largeGroupSize === 0) {
			return groupColors[scaleLevel + 1]
		} else if (index % mediumGroupSize === 0) {
			return groupColors[scaleLevel - 0]
		} else if (index % smallGroupSize === 0) {
			return groupColors[scaleLevel - 1]
		}

		return 'gray'
	}, [index, largeGroupSize, mediumGroupSize, scaleLevel, smallGroupSize])

	const getDividerHeight = useCallback(() => {
		if (index % largeGroupSize === 0) {
			return 2.5
		} else if (index % mediumGroupSize === 0) {
			return 2
		} else if (index % smallGroupSize === 0) {
			return 1.5
		}
		return 1
	}, [index, largeGroupSize, mediumGroupSize, smallGroupSize])

	const lineColor = useMemo(getLineColor, [getLineColor])
	const dividerHeight = useMemo(getDividerHeight, [getDividerHeight])

	return (
		<DividerContainer key={rawIndex} offset={dividerPosition} className={visible ? 'visible' : ''}>
			{labelDisplayed && (
				<DividerLabel>{timeToShortLabel(scaledTimeToRealTime(index * lineSpacing), scaleLevel)}</DividerLabel>
			)}
			<Divider color={lineColor} height={dividerHeight} />
		</DividerContainer>
	)
}

export const TimelineAnchorLine = memo(
	TimelineAnchorLineComponent,
	(a, b) =>
		getLoop(a) === getLoop(b) &&
		a.timelineScale === b.timelineScale &&
		a.visible === b.visible &&
		a.lineSpacing === b.lineSpacing &&
		a.positionNormalizer === b.positionNormalizer &&
		a.timeToShortLabel === b.timeToShortLabel
)
