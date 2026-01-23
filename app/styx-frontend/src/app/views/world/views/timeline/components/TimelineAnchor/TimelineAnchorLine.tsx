import Box from '@mui/material/Box'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { LineSpacing } from '@/app/utils/constants'
import { keysOf } from '@/app/utils/keysOf'

import { CONTROLLED_SCROLLER_SIZE } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { DividerLabel } from './styles'
import { TimelineAnchorPadding } from './TimelineAnchor'

const ANCHOR_RESET_PERIOD = 1000 // Must match TimelineAnchorContainer's RESET_PERIOD

export const getPixelsPerLoop = ({ lineCount }: { lineCount: number }) => lineCount * LineSpacing

export const getLoop = ({
	index,
	lineCount,
	timelineScroll,
}: {
	index: number
	lineCount: number
	timelineScroll: number
}) =>
	-Math.floor(
		(index * LineSpacing + timelineScroll + TimelineAnchorPadding) / getPixelsPerLoop({ lineCount }),
	)

type Props = {
	// Theme to use for styling
	theme: CustomTheme
	// Raw index of the anchor line
	index: number
	// Total number of the anchor lines
	lineCount: number
	// Current level of scale
	scaleLevel: ScaleLevel
	scaledTimeToRealTime: ReturnType<typeof useTimelineWorldTime>['scaledTimeToRealTime']
	smallGroupSize: number
	mediumGroupSize: number
	largeGroupSize: number
	containerWidth: number
}

export const TimelineAnchorLine = memo(TimelineAnchorLineComponent)

function TimelineAnchorLineComponent(props: Props) {
	const {
		theme,
		index: rawIndex,
		lineCount,
		scaleLevel,
		scaledTimeToRealTime,
		smallGroupSize,
		mediumGroupSize,
		largeGroupSize,
		containerWidth,
	} = props

	const { parseTime, timeToShortLabel } = useWorldTime()
	const getDividerSize = useCallback(
		({
			isLargeGroup,
			isMediumGroup,
			isSmallGroup,
		}: {
			isLargeGroup: boolean
			isMediumGroup: boolean
			isSmallGroup: boolean
		}) => {
			if (isLargeGroup) {
				return { width: 5, height: 3 }
			} else if (isMediumGroup) {
				return { width: 2, height: 2.5 }
			} else if (isSmallGroup) {
				return { width: 1, height: 2 }
			}
			return { width: 1, height: 1 }
		},
		[],
	)

	const cssVariablesRef = useRef({
		'--divider-position': `0px`,
		'--z-index': 0,
		'--font-weight': 400,
		'--divider-width': '1px',
		'--divider-height': '8px',
		'--divider-margin': '-4px',
		'--divider-display': 'none',
	} as Record<string, unknown>)

	const ref = useRef<HTMLDivElement>(null)

	// TODO remove duplication
	const getLabel = (scroll: number) => {
		const loopIndex = getLoop({
			index: rawIndex,
			lineCount,
			timelineScroll: scroll,
		})

		const index = rawIndex + loopIndex * lineCount

		const parsedTime = parseTime(scaledTimeToRealTime(index * LineSpacing))
		const isStartOfMonth = parsedTime.monthDay === 1 && parsedTime.hour === 0 && parsedTime.minute === 0
		const isStartOfYear =
			parsedTime.monthIndex === 0 && parsedTime.day === 1 && parsedTime.hour === 0 && parsedTime.minute === 0

		const isSmallGroup = index % smallGroupSize === 0
		const isMediumGroup =
			(isSmallGroup && index % mediumGroupSize === 0) ||
			(scaleLevel === 2 && isStartOfMonth) ||
			(scaleLevel === 3 && isStartOfMonth)
		const isLargeGroup =
			isMediumGroup &&
			(index % largeGroupSize === 0 ||
				(scaleLevel === 1 && isStartOfMonth) ||
				(scaleLevel === 2 && isStartOfYear) ||
				(scaleLevel === 3 && isStartOfYear))

		const labelSize = (() => {
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
		})()

		return labelSize
			? timeToShortLabel(scaledTimeToRealTime(index * LineSpacing), scaleLevel, labelSize)
			: null
	}

	const [displayedLabel, setDisplayedLabel] = useState<string | null>(getLabel(TimelineState.scroll))
	const displayedLabelRef = useRef(displayedLabel)

	const updateVariables = useCallback(
		(scroll: number) => {
			const loopIndex = getLoop({
				index: rawIndex,
				lineCount,
				timelineScroll: scroll,
			})
			const index = rawIndex + loopIndex * lineCount

			// Calculate position using chunked scroll like events do
			const actualPosition = index * LineSpacing
			const dividerPosition =
				actualPosition +
				Math.floor(scroll / ANCHOR_RESET_PERIOD) * ANCHOR_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE

			const parsedTime = parseTime(scaledTimeToRealTime(index * LineSpacing))
			const isStartOfMonth = parsedTime.monthDay === 1 && parsedTime.hour === 0 && parsedTime.minute === 0
			const isStartOfYear =
				parsedTime.monthIndex === 0 &&
				parsedTime.day === 1 &&
				parsedTime.hour === 0 &&
				parsedTime.minute === 0

			const isSmallGroup = index % smallGroupSize === 0
			const isMediumGroup =
				(isSmallGroup && index % mediumGroupSize === 0) ||
				(scaleLevel === 2 && isStartOfMonth) ||
				(scaleLevel === 3 && isStartOfMonth)
			const isLargeGroup =
				isMediumGroup &&
				(index % largeGroupSize === 0 ||
					(scaleLevel === 1 && isStartOfMonth) ||
					(scaleLevel === 2 && isStartOfYear) ||
					(scaleLevel === 3 && isStartOfYear))

			const labelSize = (() => {
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
			})()

			if (!labelSize) {
				if (displayedLabelRef.current !== null) {
					setDisplayedLabel(null)
					displayedLabelRef.current = null
				}
				return
			}

			const { width: dividerWidth, height: dividerHeight } = getDividerSize({
				isLargeGroup,
				isMediumGroup,
				isSmallGroup,
			})

			const label = labelSize
				? timeToShortLabel(scaledTimeToRealTime(index * LineSpacing), scaleLevel, labelSize)
				: null

			const variables = {
				'--divider-position': `${dividerPosition}px`,
				'--z-index': labelSize === 'large' ? 2 : labelSize === 'medium' ? 1 : 0,
				'--font-weight': labelSize === 'large' ? 600 : labelSize === 'medium' ? 600 : 400,
				'--divider-width': `${dividerWidth}px`,
				'--divider-height': `${dividerHeight * 8}px`,
				'--divider-margin': `${-dividerWidth / 2}px`,
			} as Record<string, unknown>

			keysOf(variables).forEach((key) => {
				const value = variables[key]
				if (value === cssVariablesRef.current[key]) {
					return
				}
				ref.current?.style.setProperty(key, value as string)
			})
			cssVariablesRef.current = variables
			if (displayedLabelRef.current !== label) {
				displayedLabelRef.current = label
				setDisplayedLabel(label)
			}
		},
		[
			getDividerSize,
			largeGroupSize,
			lineCount,
			mediumGroupSize,
			parseTime,
			rawIndex,
			scaleLevel,
			scaledTimeToRealTime,
			smallGroupSize,
			timeToShortLabel,
		],
	)

	const lastSeenScroll = useRef<number | null>(null)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			updateVariables(newScroll)
			lastSeenScroll.current = newScroll
		},
	})

	useEffect(() => {
		updateVariables(TimelineState.scroll)
	}, [containerWidth, updateVariables])

	useEffect(() => {
		if (!ref.current) {
			return
		}
		updateVariables(TimelineState.scroll)
	}, [updateVariables, ref, containerWidth])

	if (!displayedLabel) {
		return null
	}

	return (
		<Box
			ref={ref}
			style={cssVariablesRef.current}
			sx={{
				position: 'absolute',
				height: 0,
				pointerEvents: 'none',
				fontWeight: 'var(--font-weight)',
				transform: `translateX(var(--divider-position))`,
			}}
		>
			{displayedLabel && <DividerLabel $theme={theme}>{displayedLabel}</DividerLabel>}
			<Box
				sx={{
					position: 'absolute',
					background: 'gray',
					bottom: 0,
					borderRadius: '4px 4px 0 0',
					width: 'var(--divider-width)',
					height: 'var(--divider-height)',
					marginleft: 'var(--divider-margin)',
				}}
			/>
		</Box>
	)
}
