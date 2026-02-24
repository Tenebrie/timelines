import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { EventParams } from '@/app/features/eventBus/types'
import { CustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { CONTROLLED_SCROLLER_SIZE } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { ElementPool } from './ElementPool'
import { ANCHOR_RESET_PERIOD } from './TimelineAnchorLine'

// Styled container for followers - uses CSS calc for positions based on CSS variables
const FollowersContainer = styled('div')({
	'& .timeline-follower': {
		position: 'absolute',
		borderLeft: '1px solid gray',
		bottom: 0,
		borderRadius: '4px 4px 0 0',
		width: '1px',
		height: '9px',
		// Use CSS calc with inherited --follower-spacing from parent
		marginLeft: 'calc(var(--follower-index, 1) * var(--follower-spacing, 0px))',
	},
})

export type SlotData = EventParams['timeline/anchor/updateSlot']['data'] | null

const followerPool = new ElementPool()

type Props = {
	slotId: number
	theme: CustomTheme
	containerWidth: number
}

export const TimelineAnchorSlot = memo(TimelineAnchorSlotComponent)

function TimelineAnchorSlotComponent({ slotId, theme, containerWidth }: Props) {
	const dataRef = useRef<SlotData>(null)

	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { timeToLabel } = useWorldTime()

	const ref = useRef<HTMLDivElement>(null)
	const labelRef = useRef<HTMLDivElement>(null)
	const followersRef = useRef<HTMLDivElement>(null)
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })

	const previousCssRef = useRef<string>('')

	const updateDOM = useCallback(
		(scroll: number) => {
			const el = ref.current
			if (!el) return

			const currentData = dataRef.current
			if (!currentData) {
				el.style.setProperty('--slot-visibility', 'hidden')
				return
			}

			const { timestamp, size: labelSize, formatString, followerCount, followerSpacing } = currentData

			// Calculate position
			const actualPosition = realTimeToScaledTime(timestamp)
			const dividerPosition =
				actualPosition +
				Math.floor(scroll / ANCHOR_RESET_PERIOD) * ANCHOR_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE

			const { width: dividerWidth, height: dividerHeight } = getDividerSize(labelSize)
			const fontWeight = labelSize === 'large' || labelSize === 'medium' ? '600' : '400'

			const newStyleString = `
				--slot-visibility: visible;
				--slot-position: ${Math.round(dividerPosition)}px;
				--slot-font-weight: ${fontWeight};
				--divider-width: ${dividerWidth}px;
				--divider-height: ${dividerHeight * 8}px;
				--divider-margin: ${-dividerWidth}px;
				--follower-spacing: ${realTimeToScaledTime(followerSpacing)}px;
			`

			if (previousCssRef.current === newStyleString) {
				return
			}
			previousCssRef.current = newStyleString

			el.style.cssText = newStyleString

			// Update label text (only textContent, no style changes)
			if (labelRef.current) {
				const label = formatString ? timeToLabel(timestamp, formatString) : ' '
				labelRef.current.firstChild!.nodeValue = label
			}

			// Update followers
			const followersEl = followersRef.current
			if (followersEl) {
				const existingFollowers = followersEl.children.length

				// Add missing followers
				for (let i = existingFollowers; i < followerCount; i++) {
					const follower = followerPool.rent()
					follower.className = 'timeline-follower'
					follower.style.setProperty('--follower-index', String(i + 1))
					followersEl.appendChild(follower)
				}

				// Remove extra followers
				while (followersEl.children.length > followerCount && followersEl.lastChild) {
					const follower = followersEl.lastChild as HTMLDivElement
					followerPool.release(follower)
				}

				// Only update follower indices if count changed (positions use CSS calc)
				if (existingFollowers !== followerCount) {
					for (let i = 0; i < followerCount; i++) {
						const follower = followersEl.children[i] as HTMLDivElement
						follower.style.setProperty('--follower-index', String(i + 1))
					}
				}
			}
		},
		[realTimeToScaledTime, timeToLabel],
	)

	// Listen for targeted updates to this slot
	useEventBusSubscribe['timeline/anchor/updateSlot']({
		condition: (event) => event.slotId === slotId,
		callback: (event) => {
			dataRef.current = event.data
			updateDOM(TimelineState.scroll)
		},
	})

	const lastSeenScroll = useRef<number | null>(null)

	useEventBusSubscribe['timeline/onScroll']({
		callback: (newScroll) => {
			if (lastSeenScroll.current !== null && Math.abs(lastSeenScroll.current - newScroll) < 80) {
				return
			}
			updateDOM(newScroll)
			lastSeenScroll.current = newScroll
		},
	})

	useEventBusSubscribe['timeline/pips/forceUpdate']({
		callback: (newScroll) => {
			updateDOM(newScroll)
		},
	})

	useEffect(() => {
		updateDOM(TimelineState.scroll)
	}, [containerWidth, updateDOM])

	return (
		<Box
			ref={ref}
			sx={{
				position: 'absolute',
				height: 0,
				pointerEvents: 'none',
				visibility: 'var(--slot-visibility, hidden)',
				transform: 'translateX(var(--slot-position, 0px))',
				fontWeight: 'var(--slot-font-weight, 400)',
				// Optimize for animations - hint browser to use GPU layer
				willChange: 'transform',
				contain: 'layout style',
			}}
		>
			<div
				ref={labelRef}
				style={{
					transform: 'translateX(-50%)',
					position: 'absolute',
					top: 0,
					height: '30px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					whiteSpace: 'pre',
					borderRadius: '4px',
					color: theme.custom.palette.timelineAnchor.text,
				}}
			>
				{/* Empty text node for direct updates */}{' '}
			</div>
			<div
				style={{
					position: 'absolute',
					borderLeft: 'var(--divider-width, 1px) solid gray',
					borderRight: 'var(--divider-width, 1px) solid gray',
					bottom: 0,
					borderRadius: '4px 4px 0 0',
					width: '0',
					height: 'var(--divider-height, 8px)',
					marginLeft: 'var(--divider-margin, 0px)',
				}}
			/>
			<FollowersContainer ref={followersRef} />
		</Box>
	)
}

function getDividerSize(labelSize: 'large' | 'medium' | 'small' | 'smallest') {
	if (labelSize === 'large') {
		return { width: 4, height: 3 }
	} else if (labelSize === 'medium') {
		return { width: 2, height: 2.5 }
	} else if (labelSize === 'small') {
		return { width: 1, height: 2 }
	}
	return { width: 1, height: 1 }
}
