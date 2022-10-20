import { memo, useMemo } from 'react'

import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { Divider, DividerContainer, DividerLabel } from './styles'

const getPixelsPerLoop = ({
	lineCount,
	scaleLevel,
	pixelsPerLine,
}: {
	lineCount: number
	scaleLevel: number
	pixelsPerLine: number
}) => (lineCount * pixelsPerLine) / scaleLevel

const getLoop = ({
	index,
	lineCount,
	timePerPixel,
	pixelsPerLine,
	scaleLevel,
	timelineScroll,
}: {
	index: number
	lineCount: number
	pixelsPerLine: number
	timePerPixel: number
	scaleLevel: number
	timelineScroll: number
}) =>
	Math.abs(
		Math.floor(
			((index * pixelsPerLine) / scaleLevel + timelineScroll * timePerPixel) /
				getPixelsPerLoop({ lineCount, scaleLevel, pixelsPerLine })
		)
	)

type Props = {
	index: number
	lineCount: number
	timePerPixel: number
	pixelsPerLine: number
	scaleLevel: number
	visible: boolean
	timelineScroll: number
}

const TimelineAnchorLineComponent = (props: Props) => {
	const { index, lineCount, timePerPixel, pixelsPerLine, scaleLevel, visible, timelineScroll } = props

	const { timeToLabel } = useWorldTime()

	const labelDisplayed =
		index % 50 === 0 ||
		(scaleLevel === 0.001 && timePerPixel <= 512 && index % 10 === 0) ||
		(scaleLevel === 0.01 && timePerPixel <= 64 && index % 10 === 0) ||
		(scaleLevel === 0.1 && timePerPixel <= 8 && index % 10 === 0) ||
		(scaleLevel === 1 && timePerPixel <= 0.5 && index % 10 === 0) ||
		(scaleLevel === 1 && timePerPixel <= 0.25 && index % 5 === 0)

	const loopIndex = getLoop({ index, lineCount, timePerPixel, pixelsPerLine, scaleLevel, timelineScroll })
	const loopOffset = loopIndex * getPixelsPerLoop({ lineCount, scaleLevel, pixelsPerLine })
	const dividerPosition = Math.round(((index * pixelsPerLine) / scaleLevel + loopOffset) / timePerPixel)

	const getLineColor = () => {
		if (index % 10 > 0) {
			if (scaleLevel === 1) {
				return '#777'
			} else if (scaleLevel === 0.1) {
				return '#877'
			} else if (scaleLevel === 0.01) {
				return '#887'
			} else if (scaleLevel === 0.001) {
				return '#788'
			}
		}
		const adjustedIndex = (index + loopIndex * lineCount) / scaleLevel
		if (adjustedIndex % 50000 === 0 && scaleLevel <= 0.001) {
			return '#63ffc8'
		} else if (adjustedIndex % 5000 === 0 && scaleLevel <= 0.01) {
			return '#ffd026'
		} else if (adjustedIndex % 500 === 0 && scaleLevel <= 0.1) {
			return '#ff6363'
		} else if (adjustedIndex % 50 === 0 && scaleLevel <= 1) {
			return '#EAADE9'
		} else if (adjustedIndex % 5 === 0) {
			return '#E9EAAD'
		}

		return 'gray'
	}

	const getDividerHeight = () => {
		if (index % 50 === 0) {
			return 2.5
		} else if (index % 10 === 0) {
			return 2
		} else if (index % 5 === 0) {
			return 1.5
		}
		return 1
	}

	const lineColor = useMemo(getLineColor, [index, lineCount, scaleLevel, loopIndex])
	const dividerHeight = useMemo(getDividerHeight, [index])

	const includeTime = timePerPixel * pixelsPerLine * 15 < 1000

	return (
		<DividerContainer key={index} offset={dividerPosition} className={visible ? 'visible' : ''}>
			{index % 10 === 0 && (
				<DividerLabel className={labelDisplayed ? 'visible' : ''}>
					{timeToLabel(((index + lineCount * loopIndex) * pixelsPerLine) / scaleLevel, includeTime)}
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
		a.timePerPixel === b.timePerPixel &&
		a.visible === b.visible &&
		a.pixelsPerLine === b.pixelsPerLine
)
