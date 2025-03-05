import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'
import { Container } from './styles'

type Props = {
	timestamp: number
}

export const TimeMarker = ({ timestamp }: Props) => {
	const { scaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) =>
			a.scroll === b.scroll && a.scaleLevel === b.scaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)
	const { calendar, isLoaded } = useSelector(
		getWorldState,
		(a, b) => a.calendar === b.calendar && a.isLoaded === b.isLoaded,
	)
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel, calendar })

	const theme = useCustomTheme()

	const ref = useRef<HTMLDivElement | null>(null)
	const updatePosition = useCallback(
		(scroll: number) => {
			const offset = Math.round(realTimeToScaledTime(timestamp)) + scroll
			ref.current?.style.setProperty('--marker-scroll', `${offset}px`)
		},
		[realTimeToScaledTime, timestamp],
	)

	useEffect(() => {
		updatePosition(TimelineState.scroll)
	}, [timestamp, updatePosition])

	useEventBusSubscribe({ event: 'timelineScrolled', callback: (newScroll) => updatePosition(newScroll) })

	return (
		<Box ref={ref} sx={{ height: '100%', transform: 'translateX(var(--marker-scroll))' }}>
			<Container $theme={theme} className={`${isSwitchingScale || !isLoaded ? 'hidden' : ''}`} />
		</Box>
	)
}
