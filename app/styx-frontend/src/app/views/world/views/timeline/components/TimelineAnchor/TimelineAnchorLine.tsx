import Box from '@mui/material/Box'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { LineSpacing } from '@/app/utils/constants'
import { keysOf } from '@/app/utils/keysOf'

import { CONTROLLED_SCROLLER_SIZE } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { DividerLabel } from './styles'
import { TimelineAnchorPadding } from './TimelineAnchor'
import { useAnchorLineLabel } from './useAnchorLineLabel'
import { usePresentationUnit } from './usePresentationUnit'

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
	const { theme, index: rawIndex, lineCount, scaleLevel, scaledTimeToRealTime, containerWidth } = props

	const getDividerSize = useCallback(({ labelSize }: { labelSize: 'large' | 'medium' | 'small' | null }) => {
		if (labelSize === 'large') {
			return { width: 5, height: 3 }
		} else if (labelSize === 'medium') {
			return { width: 2, height: 2.5 }
		} else if (labelSize === 'small') {
			return { width: 1, height: 2 }
		}
		return { width: 1, height: 1 }
	}, [])

	const [timelineScroll, setTimelineScroll] = useState(0)
	const anchorLineIndex = useMemo(() => {
		const loopIndex = getLoop({
			index: rawIndex,
			lineCount,
			timelineScroll,
		})
		return rawIndex + loopIndex * lineCount
	}, [lineCount, rawIndex, timelineScroll])

	const timestamp = scaledTimeToRealTime(anchorLineIndex * LineSpacing)
	const { labelSize, formatString } = usePresentationUnit({ timestamp })
	const { label, refreshLabel } = useAnchorLineLabel({ labelSize, timestamp, formatString })

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

			if (!labelSize) {
				refreshLabel()
				return
			}

			const { width: dividerWidth, height: dividerHeight } = getDividerSize({ labelSize })

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

			refreshLabel()
		},
		[rawIndex, lineCount, labelSize, getDividerSize, refreshLabel],
	)

	const lastSeenScroll = useRef<number | null>(null)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			if (lastSeenScroll.current !== null && Math.abs(lastSeenScroll.current - newScroll) < 80) {
				return
			}
			updateVariables(newScroll)
			setTimelineScroll(newScroll)
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

	if (!label) {
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
			{label && <DividerLabel $theme={theme}>{label}</DividerLabel>}
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
