import Box from '@mui/material/Box'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { keysOf } from '@/app/utils/keysOf'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { CONTROLLED_SCROLLER_SIZE } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { DividerLabel } from './styles'
import { useAnchorLineLabel } from './useAnchorLineLabel'

export const ANCHOR_RESET_PERIOD = CONTROLLED_SCROLLER_SIZE / 10

type Props = {
	theme: CustomTheme
	timestamp: number
	size: 'large' | 'medium' | 'small' | 'smallest'
	containerWidth: number
	formatString: string
	followerCount: number
	followerSpacing: number
}

export const TimelineAnchorLine = memo(TimelineAnchorLineComponent)

function TimelineAnchorLineComponent(props: Props) {
	const {
		theme,
		timestamp,
		followerCount,
		followerSpacing,
		size: labelSize,
		formatString,
		containerWidth,
	} = props

	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
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
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })

	const updateVariables = useCallback(
		(scroll: number) => {
			// Calculate position using chunked scroll like events do
			const actualPosition = realTimeToScaledTime(timestamp)
			const dividerPosition =
				actualPosition +
				Math.floor(scroll / ANCHOR_RESET_PERIOD) * ANCHOR_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE

			if (!labelSize) {
				refreshLabel()
				return
			}

			const { width: dividerWidth, height: dividerHeight } = getDividerSize(labelSize)

			const positionOffset = labelSize === 'large' ? -1.5 : 0
			const variables = {
				'--divider-position': `${dividerPosition}px`,
				'--z-index': labelSize === 'large' ? 2 : labelSize === 'medium' ? 1 : 0,
				'--font-weight': labelSize === 'large' ? 600 : labelSize === 'medium' ? 600 : 400,
				'--divider-width': `${dividerWidth}px`,
				'--divider-height': `${dividerHeight * 8}px`,
				'--divider-margin': `${positionOffset}px`,
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
		[realTimeToScaledTime, timestamp, labelSize, refreshLabel],
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
					marginLeft: 'var(--divider-margin)',
				}}
			/>
			{followerCount > 0 &&
				Array(followerCount)
					.fill(0)
					.map((_, index) => (
						<Box
							key={index}
							sx={{
								position: 'absolute',
								background: 'gray',
								bottom: 0,
								borderRadius: '4px 4px 0 0',
								width: '1px',
								height: '9px',
								marginLeft: `calc(${(index + 1) * realTimeToScaledTime(followerSpacing)}px)`,
							}}
						/>
					))}
		</Box>
	)
}

function getDividerSize(labelSize: 'large' | 'medium' | 'small' | 'smallest' | null) {
	if (labelSize === 'large') {
		return { width: 5, height: 3 }
	} else if (labelSize === 'medium') {
		return { width: 2, height: 2.5 }
	} else if (labelSize === 'small') {
		return { width: 1, height: 2 }
	}
	return { width: 1, height: 1 }
}
