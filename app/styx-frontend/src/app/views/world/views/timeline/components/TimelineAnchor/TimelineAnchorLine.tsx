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

export const ANCHOR_RESET_PERIOD = CONTROLLED_SCROLLER_SIZE / 10

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

	const { parseTime, timeToShortLabel, units, presentation } = useWorldTime({ scaleLevel })
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
		// const loopIndex = getLoop({
		// 	index: rawIndex,
		// 	lineCount,
		// 	timelineScroll: scroll,
		// })

		// const index = rawIndex + loopIndex * lineCount

		// // const parsedTime = parseTime(scaledTimeToRealTime(index * LineSpacing))
		// // const isStartOfMonth = parsedTime.monthDay === 1 && parsedTime.hour === 0 && parsedTime.minute === 0
		// // const isStartOfYear =
		// // 	parsedTime.monthIndex === 0 && parsedTime.day === 1 && parsedTime.hour === 0 && parsedTime.minute === 0

		// const parsedTime = parseTime({ timestamp: scaledTimeToRealTime(index * LineSpacing) })

		// const largeUnit =
		// 	presentation.units.length > 0
		// 		? {
		// 				...presentation.units[0],
		// 				displayName: units.find((u) => u.id === presentation.units[0].unitId)?.displayName ?? '',
		// 			}
		// 		: null
		// const mediumUnit =
		// 	presentation.units.length > 1
		// 		? {
		// 				...presentation.units[1],
		// 				displayName: units.find((u) => u.id === presentation.units[1].unitId)?.displayName ?? '',
		// 			}
		// 		: null
		// const smallUnit =
		// 	presentation.units.length > 2
		// 		? {
		// 				...presentation.units[2],
		// 				displayName: units.find((u) => u.id === presentation.units[2].unitId)?.displayName ?? '',
		// 			}
		// 		: null

		// const isSmallGroup = parsedTime
		// 	.values()
		// 	.some((e) => e.unit.displayName === smallUnit?.displayName && e.value === 1)
		// const isMediumGroup = parsedTime
		// 	.values()
		// 	.some((e) => e.unit.displayName === mediumUnit?.displayName && e.value === 1)
		// const isLargeGroup = parsedTime
		// 	.values()
		// 	.some((e) => e.unit.displayName === largeUnit?.displayName && e.value === 1)

		// const labelSize = (() => {
		// 	if (isLargeGroup) {
		// 		return 'large'
		// 	}
		// 	if (isMediumGroup) {
		// 		return 'medium'
		// 	}
		// 	if (isSmallGroup) {
		// 		return 'small'
		// 	}

		// 	return null
		// })()

		// return labelSize
		// 	? timeToShortLabel(scaledTimeToRealTime(index * LineSpacing), scaleLevel, labelSize)
		// 	: null
		return ''
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

			// const parsedTime = parseTime(scaledTimeToRealTime(index * LineSpacing))
			// const isStartOfMonth = parsedTime.monthDay === 1 && parsedTime.hour === 0 && parsedTime.minute === 0
			// const isStartOfYear =
			// 	parsedTime.monthIndex === 0 &&
			// 	parsedTime.day === 1 &&
			// 	parsedTime.hour === 0 &&
			// 	parsedTime.minute === 0

			const timestamp = scaledTimeToRealTime(index * LineSpacing)
			const parsedTime = parseTime({ timestamp })

			const largeUnit =
				presentation.units.length > 0
					? {
							...presentation.units[0],
							displayName: units.find((u) => u.id === presentation.units[0].unitId)?.displayName ?? '',
						}
					: null
			const mediumUnit =
				presentation.units.length > 1
					? {
							...presentation.units[1],
							displayName: units.find((u) => u.id === presentation.units[1].unitId)?.displayName ?? '',
						}
					: null
			const smallUnit =
				presentation.units.length > 2
					? {
							...presentation.units[2],
							displayName: units.find((u) => u.id === presentation.units[2].unitId)?.displayName ?? '',
						}
					: null

			const largeUnitValue =
				parsedTime.values().find((e) => e.unit.displayName === largeUnit?.displayName)?.value ?? -1
			const mediumUnitValue =
				parsedTime.values().find((e) => e.unit.displayName === mediumUnit?.displayName)?.value ?? -1
			const smallUnitValue =
				parsedTime.values().find((e) => e.unit.displayName === smallUnit?.displayName)?.value ?? -1

			const isSmallGroup = false
			const isMediumGroup = smallUnitValue === 0
			const isLargeGroup = false

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

			const offset = labelSize === 'large' ? 2 : 0
			const variables = {
				'--divider-position': `${dividerPosition - offset}px`,
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
			if (lastSeenScroll.current !== null && Math.abs(lastSeenScroll.current - newScroll) < 80) {
				return
			}
			updateVariables(newScroll)
			lastSeenScroll.current = newScroll
		},
	})

	useEventBusSubscribe['timeline/pips/forceUpdate']({
		callback: (newScroll) => {
			updateVariables(newScroll)
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
