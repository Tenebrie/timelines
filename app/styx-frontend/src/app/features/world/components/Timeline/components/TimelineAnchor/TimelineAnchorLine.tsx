import { memo, useCallback, useMemo } from 'react'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { CustomTheme } from '@/hooks/useCustomTheme'

import { ScaleLevel } from '../../types'
import { Divider, DividerContainer, DividerLabel } from './styles'
import { TimelineAnchorPadding } from './TimelineAnchor'

export const getPixelsPerLoop = ({ lineCount, lineSpacing }: { lineCount: number; lineSpacing: number }) =>
	lineCount * lineSpacing

export const getLoop = ({
	index,
	lineCount,
	lineSpacing,
	timelineScroll,
}: {
	index: number
	lineCount: number
	lineSpacing: number
	timelineScroll: number
}) =>
	-Math.floor(
		(index * lineSpacing + timelineScroll + TimelineAnchorPadding) /
			getPixelsPerLoop({ lineCount, lineSpacing }),
	)

type Props = {
	// Theme to use for styling
	theme: CustomTheme
	// Raw index of the anchor line
	index: number
	// Total number of the anchor lines
	lineCount: number
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
	isSmallGroup: boolean
	isMediumGroup: boolean
	isLargeGroup: boolean
}

const TimelineAnchorLineComponent = (props: Props) => {
	const {
		theme,
		index: rawIndex,
		lineCount,
		lineSpacing,
		scaleLevel,
		visible,
		timelineScroll,
		positionNormalizer,
		timeToShortLabel,
		scaledTimeToRealTime,
		isSmallGroup,
		isMediumGroup,
		isLargeGroup,
	} = props

	const loopIndex = useMemo(
		() =>
			getLoop({
				index: rawIndex,
				lineCount,
				lineSpacing,
				timelineScroll,
			}),
		[lineCount, lineSpacing, rawIndex, timelineScroll],
	)
	const loopOffset = useMemo(
		() => loopIndex * getPixelsPerLoop({ lineCount, lineSpacing }),
		[lineCount, lineSpacing, loopIndex],
	)
	const dividerPosition = useMemo(
		() => Math.round((rawIndex * lineSpacing) / 1 + loopOffset) + positionNormalizer,
		[lineSpacing, loopOffset, positionNormalizer, rawIndex],
	)

	const index = useMemo(() => rawIndex + loopIndex * lineCount, [lineCount, loopIndex, rawIndex])

	const labelSize = useMemo(() => {
		if (isLargeGroup) {
			return 'large'
		}
		if (isMediumGroup) {
			return 'medium'
		}
		if (
			isSmallGroup &&
			(scaleLevel === 2 ||
				scaleLevel === 3 ||
				scaleLevel === 4 ||
				scaleLevel === 5 ||
				scaleLevel === 6 ||
				scaleLevel === 7)
		) {
			return 'small'
		}

		return null
	}, [isLargeGroup, isMediumGroup, isSmallGroup, scaleLevel])

	const getLineColor = useCallback(() => {
		if (!isMediumGroup && !isLargeGroup) {
			return ''
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
		a.visible === b.visible &&
		a.lineSpacing === b.lineSpacing &&
		a.positionNormalizer === b.positionNormalizer &&
		a.timeToShortLabel === b.timeToShortLabel,
)
