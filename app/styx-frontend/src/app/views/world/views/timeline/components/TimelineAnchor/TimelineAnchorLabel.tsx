import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import throttle from 'lodash.throttle'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { EsotericDate } from '@/app/features/time/calendar/date/EsotericDate'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'

export const TimelineAnchorLabel = memo(TimelineAnchorLabelComponent)

function TimelineAnchorLabelComponent() {
	const theme = useCustomTheme()
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { timeToLabel, calendar, presentation } = useWorldTime()
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })
	const labelRef = useRef<HTMLButtonElement>(null)

	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	const updateLabel = useMemo(
		() =>
			throttle((scroll: number) => {
				if (TimelineState.anchorTimestamps.length === 0) {
					return
				}
				const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
				const snappedTime = binarySearchForClosest(TimelineState.anchorTimestamps, currentTimestamp)
				const flooredTime = new EsotericDate(calendar, snappedTime)
					.floor(presentation.smallestUnit.unit)
					.getTimestamp()
				const desiredLabel = timeToLabel(flooredTime)
				if (labelRef.current) {
					labelRef.current.textContent = desiredLabel
				}
			}, 50),
		[calendar, presentation.smallestUnit.unit, scaledTimeToRealTime, timeToLabel],
	)

	useEffect(() => {
		updateLabel(TimelineState.scroll)
	}, [scaledTimeToRealTime, timeToLabel, updateLabel])

	useEventBusSubscribe['timeline/onScroll']({
		callback: updateLabel,
	})

	return (
		<Paper
			elevation={1}
			sx={{
				position: 'absolute',
				left: 0,
				bottom: 0,
				height: 32,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: 0,
				boxShadow: 'none',
				zIndex: 1,
				background: theme.custom.palette.timelineAnchor,
				borderRight: `2px solid ${theme.custom.palette.outlineStrong}`,
			}}
		>
			<Button
				ref={labelRef}
				variant="text"
				onClick={openTimeTravelModal}
				sx={{ fontSize: 16, borderRadius: 0, padding: '2px 16px 2px 16px', height: '100%', width: '100%' }}
			>
				Label
			</Button>
		</Paper>
	)
}
