import { memo, Profiler, useCallback, useMemo } from 'react'

import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
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
		if (isSmallGroup) {
			return 'small'
		}

		return null
	}, [isLargeGroup, isMediumGroup, isSmallGroup])

	const getDividerWidth = useCallback(() => {
		if (isLargeGroup) {
			return 5
		} else if (isMediumGroup) {
			return 3
		} else if (isSmallGroup) {
			return 1
		}
		return 1
	}, [isLargeGroup, isMediumGroup, isSmallGroup])

	const getDividerHeight = useCallback(() => {
		if (isLargeGroup) {
			return 3
		} else if (isMediumGroup) {
			return 2.5
		} else if (isSmallGroup) {
			return 2
		}
		return 1
	}, [isLargeGroup, isMediumGroup, isSmallGroup])

	const dividerWidth = useMemo(getDividerWidth, [getDividerWidth])
	const dividerHeight = useMemo(getDividerHeight, [getDividerHeight])

	return (
		<Profiler id="TimelineAnchorLine" onRender={reportComponentProfile}>
			<DividerContainer
				key={rawIndex}
				offset={dividerPosition}
				className={visible ? 'visible' : ''}
				style={{
					zIndex: labelSize === 'large' ? 2 : labelSize === 'medium' ? 1 : 0,
				}}
			>
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
				<Divider color={'gray'} width={dividerWidth} height={dividerHeight} />
			</DividerContainer>
		</Profiler>
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
