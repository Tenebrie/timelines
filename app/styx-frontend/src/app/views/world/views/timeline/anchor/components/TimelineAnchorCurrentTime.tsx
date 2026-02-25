import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import throttle from 'lodash.throttle'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { EsotericDate } from '@/app/features/time/calendar/date/EsotericDate'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useWaitUntil } from '@/app/hooks/useWaitUntil'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'
import { useAnchorTimeDragDrop } from '../hooks/useAnchorTimeDragDrop'

export const TimelineAnchorCurrentTime = memo(TimelineAnchorCurrentTimeComponent)

function TimelineAnchorCurrentTimeComponent() {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { timeToLabel, calendar, presentation } = useWorldTime()
	const { scaledTimeToRealTime, realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })
	const labelRef = useRef<HTMLSpanElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	const updateLabel = useMemo(
		() =>
			throttle(({ timestamp, isDragging }: { timestamp: number; isDragging: boolean }) => {
				if (TimelineState.anchorTimestamps.length === 0) {
					return
				}

				const snappedTime = binarySearchForClosest(TimelineState.anchorTimestamps, timestamp)
				const smallestBackingUnit = calendar.units.find((u) => u.id === presentation.smallestUnit?.unitId)
				if (!smallestBackingUnit) {
					return
				}
				const flooredTime = new EsotericDate(calendar, snappedTime).round(smallestBackingUnit).getTimestamp()
				const desiredLabel = timeToLabel(flooredTime)
				if (labelRef.current && labelRef.current.firstChild) {
					labelRef.current.firstChild.nodeValue = desiredLabel
				}

				if (isDragging) {
					const containerWidth = containerRef.current?.offsetWidth ?? 0
					const labelWidth = labelRef.current?.offsetWidth ?? 0
					const rawLeft = realTimeToScaledTime(flooredTime) + TimelineState.scroll - containerWidth / 2
					const padding = 8
					const minLeft = -(containerWidth - labelWidth) / 2 + padding
					const maxLeft = (containerWidth - labelWidth) / 2 - padding
					const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft))
					labelRef.current?.style.setProperty('left', `${clampedLeft}px`)
				}
			}, 50),
		[calendar, presentation.smallestUnit?.unitId, realTimeToScaledTime, timeToLabel],
	)

	const waitUntil = useWaitUntil()
	useEffect(() => {
		;(async () => {
			await waitUntil(() => TimelineState.anchorTimestamps.length > 0 && containerRef.current !== null)
			updateLabel({ timestamp: TimelineState.scroll, isDragging: false })
			labelRef.current?.style.setProperty('left', `${0}px`)
		})()
	}, [updateLabel, waitUntil])

	useAnchorTimeDragDrop({
		onTimeChange: (dragPosition) => {
			const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll + dragPosition - 74)
			updateLabel({ timestamp: currentTimestamp, isDragging: true })
		},
		onClear: () => {
			const containerWidth = containerRef.current?.offsetWidth ?? 0
			const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll + containerWidth / 2)
			updateLabel({ timestamp: currentTimestamp, isDragging: false })
			labelRef.current?.style.setProperty('left', `${0}px`)
		},
	})

	useEventBusSubscribe['timeline/onScroll']({
		callback: (scroll) => {
			const containerWidth = containerRef.current?.offsetWidth ?? 0
			const currentTimestamp = scaledTimeToRealTime(-scroll + containerWidth / 2)
			updateLabel({ timestamp: currentTimestamp, isDragging: false })
		},
	})

	return (
		<Paper
			ref={containerRef}
			elevation={1}
			sx={{
				position: 'absolute',
				left: 0,
				bottom: 0,
				width: '100%',
				height: 32,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: 0,
				boxShadow: 'none',
				overflow: 'hidden',
				zIndex: 5,
			}}
		>
			<Button
				variant="text"
				onClick={openTimeTravelModal}
				sx={{ fontSize: 16, borderRadius: 0, padding: '2px 16px 2px 16px', height: '100%', width: '100%' }}
			>
				<Box
					sx={{
						position: 'absolute',
						left: 0,
						marginLeft: '50%',
						transform: 'translateX(-50%)',
						textWrap: 'nowrap',
						transition: 'left 0.1s',
					}}
					ref={labelRef}
				>
					...
				</Box>
			</Button>
		</Paper>
	)
}
