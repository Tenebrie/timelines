import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getTimelineState, getWorldState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { Container } from './styles'

type Props = {
	timestamp: number
}

export const TimeMarker = ({ timestamp }: Props) => {
	const [scroll, setScroll] = useState(0)
	useEventBusSubscribe({ event: 'timelineScrolled', callback: ({ newScroll }) => setScroll(newScroll) })

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
	const offset = Math.round(realTimeToScaledTime(timestamp)) + scroll
	const theme = useCustomTheme()

	return (
		<>
			{isLoaded && (
				<Container $theme={theme} $offset={offset} className={`${isSwitchingScale ? 'hidden' : ''}`} />
			)}
		</>
	)
}
