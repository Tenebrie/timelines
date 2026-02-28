import Box from '@mui/material/Box'
import { memo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { CONTROLLED_SCROLLER_SIZE } from '../../tracks/components/ControlledScroller'
import { TimelineState } from '../../utils/TimelineState'
import { useAnchorTimeDragDrop } from '../hooks/useAnchorTimeDragDrop'
import { ANCHOR_RESET_PERIOD } from '../TimelineAnchorLinesItem'

export const TimelineAnchorTargetReticle = memo(TimelineAnchorTargetReticleComponent)

function TimelineAnchorTargetReticleComponent() {
	const theme = useCustomTheme()
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { realTimeToScaledTime, scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const updateLabel = ({ timestamp }: { timestamp: number }) => {
		const el = ref.current
		if (!el) {
			return
		}

		const matchedValue = binarySearchForClosest(TimelineState.anchorTimestamps, timestamp)
		const actualPosition = realTimeToScaledTime(matchedValue)
		const divData = TimelineState.anchorTimestampExtended.find((d) => d.timestamp === matchedValue)
		if (!divData) {
			throw new Error('Anchor timestamp array mismatch')
		}
		const dividerPosition =
			actualPosition +
			Math.floor(TimelineState.scroll / ANCHOR_RESET_PERIOD) * ANCHOR_RESET_PERIOD +
			CONTROLLED_SCROLLER_SIZE

		const width = (() => {
			if (divData.size === 'large') return 10
			if (divData.size === 'medium') return 8
			if (divData.size === 'small') return 3
			return 2
		})()

		const isCurrentlyHidden = el.style.opacity === '0' || el.style.opacity === ''
		if (isCurrentlyHidden) {
			// Teleport instantly: strip transition, set position, force reflow, then restore transition
			el.style.transition = 'none'
			el.style.setProperty('--slot-position', `${Math.round(dividerPosition - width / 2)}px`)
			el.getBoundingClientRect() // force reflow so position is committed without animation
			el.style.transition = 'transform 0.1s ease-out, opacity 0.2s, height 0.2s, border-left-width 0.1s'
		} else {
			el.style.setProperty('--slot-position', `${Math.round(dividerPosition - width / 2)}px`)
		}

		el.style.height = '28px'
		el.style.opacity = '1'
		el.style.borderLeft = `${width}px solid ${theme.material.palette.secondary.main}`
	}

	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const el = ref.current
		if (!el) {
			return
		}
	}, [realTimeToScaledTime, scaleLevel])

	useAnchorTimeDragDrop({
		onTimeChange: (dragPosition) => {
			const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll + dragPosition - 74)
			updateLabel({ timestamp: currentTimestamp })
		},
		onClear: () => {
			ref.current?.style.setProperty('opacity', '0')
			ref.current?.style.setProperty('height', '0px')
		},
	})

	return (
		<Box
			ref={ref}
			sx={{
				height: '28px',
				borderLeft: '1px solid gray',
				position: 'absolute',
				bottom: '64px',
				opacity: 0,
				zIndex: 20,
				borderRadius: '4px 4px 0 0',
				transform: 'translateX(var(--slot-position, 0px))',
				transition: 'transform 0.1s ease-out, opacity 0.2s, height 0.2s, border-left-width 0.1s',
			}}
		></Box>
	)
}
