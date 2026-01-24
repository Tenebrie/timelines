import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { memo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState, getWorldCalendarState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'

export const TimelineAnchorLabel = memo(TimelineAnchorLabelComponent)

function TimelineAnchorLabelComponent() {
	const theme = useCustomTheme()
	const calendar = useSelector(getWorldCalendarState)
	const { scaleLevel } = useSelector(getTimelineState)
	const { timeToLabel } = useWorldTime()
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })
	const labelRef = useRef<HTMLButtonElement>(null)

	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	useEffect(() => {
		const currentTimestamp = scaledTimeToRealTime(-TimelineState.scroll + 40)
		if (labelRef.current) {
			labelRef.current.textContent = timeToLabel(currentTimestamp)
		}
	}, [scaledTimeToRealTime, timeToLabel])

	useEventBusSubscribe['timeline/onScroll']({
		callback: (scroll) => {
			const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
			const desiredLabel = timeToLabel(currentTimestamp)
			if (labelRef.current) {
				labelRef.current.textContent = desiredLabel
			}
		},
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
