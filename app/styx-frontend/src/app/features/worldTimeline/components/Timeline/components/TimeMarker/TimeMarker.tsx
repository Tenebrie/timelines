import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getWorldState } from '@/app/features/world/selectors'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { ScaleLevel } from '../../types'
import { Container } from './styles'

type Props = {
	timestamp: number
	scroll: number
	scaleLevel: ScaleLevel
	transitioning: boolean
}

export const TimeMarker = ({ timestamp, scroll, scaleLevel, transitioning }: Props) => {
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
				<Container $theme={theme} $offset={offset} className={`${transitioning ? 'hidden' : ''}`} />
			)}
		</>
	)
}
