import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import {
	CONTROLLED_SCROLLER_SIZE,
	ControlledScroller,
	EVENT_SCROLL_RESET_PERIOD,
} from '../../tracks/components/ControlledScroller'
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
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })

	const theme = useCustomTheme()

	const ref = useRef<HTMLDivElement | null>(null)
	const updatePosition = useCallback(
		(scroll: number) => {
			const offset = Math.round(realTimeToScaledTime(timestamp))
			const scrollOffset =
				offset +
				Math.floor(scroll / EVENT_SCROLL_RESET_PERIOD) * EVENT_SCROLL_RESET_PERIOD +
				CONTROLLED_SCROLLER_SIZE

			if (ref.current && ref.current.style.getPropertyValue('--marker-scroll') !== `${scrollOffset}px`) {
				ref.current.style.setProperty('--marker-scroll', `${scrollOffset}px`)
			}
		},
		[realTimeToScaledTime, timestamp],
	)

	useEffect(() => {
		updatePosition(TimelineState.scroll)
	}, [timestamp, updatePosition])

	useEventBusSubscribe['timeline/onScroll']({ callback: (newScroll) => updatePosition(newScroll) })

	return (
		<ControlledScroller resetPeriod={EVENT_SCROLL_RESET_PERIOD}>
			<Box
				ref={ref}
				sx={{
					height: 'calc(100% - 1px)',
					transform: 'translateX(var(--marker-scroll)) translateY(64px)',
				}}
			>
				<Container $theme={theme} className={`${isSwitchingScale || !isLoaded ? 'hidden' : ''}`} />
			</Box>
		</ControlledScroller>
	)
}
