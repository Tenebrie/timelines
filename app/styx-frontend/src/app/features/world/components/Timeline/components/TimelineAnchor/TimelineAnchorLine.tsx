import { memo, useMemo } from 'react'

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
	Math.abs(
		Math.floor(
			(index * lineSpacing + timelineScroll * timelineScale + TimelineAnchorPadding) /
				getPixelsPerLoop({ lineCount, lineSpacing })
		)
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
	} = props

	const { timeToShortLabel } = useWorldTime()
	const { scaledTimeToRealTime, getTimelineMultipliers } = useTimelineWorldTime({ scaleLevel })

	const loopIndex = getLoop({
		index: rawIndex,
		lineCount,
		timelineScale,
		lineSpacing,
		timelineScroll,
	})
	const loopOffset = loopIndex * getPixelsPerLoop({ lineCount, lineSpacing })
	const dividerPosition = Math.round(((rawIndex * lineSpacing) / 1 + loopOffset) / timelineScale)

	const { largeGroupSize, mediumGroupSize, smallGroupSize } = getTimelineMultipliers()

	const index = rawIndex + loopIndex * lineCount
	const labelDisplayed =
		index % largeGroupSize === 0 ||
		(timelineScale <= 0.5 && index % mediumGroupSize === 0) ||
		(timelineScale <= 0.25 && index % smallGroupSize === 0)

	const getLineColor = () => {
		if (index % mediumGroupSize > 0) {
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
	}

	const getDividerHeight = () => {
		if (index % largeGroupSize === 0) {
			return 2.5
		} else if (index % mediumGroupSize === 0) {
			return 2
		} else if (index % smallGroupSize === 0) {
			return 1.5
		}
		return 1
	}

	const lineColor = useMemo(getLineColor, [
		index,
		largeGroupSize,
		mediumGroupSize,
		scaleLevel,
		smallGroupSize,
	])
	const dividerHeight = useMemo(getDividerHeight, [index, largeGroupSize, mediumGroupSize, smallGroupSize])

	return (
		<DividerContainer key={index} offset={dividerPosition} className={visible ? 'visible' : ''}>
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
		a.lineSpacing === b.lineSpacing
)
