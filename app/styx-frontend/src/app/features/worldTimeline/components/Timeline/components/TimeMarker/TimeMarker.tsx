import { useSelector } from 'react-redux'

import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { getWorldCalendarState } from '@/app/features/worldTimeline/selectors'
import { useCustomTheme } from '@/hooks/useCustomTheme'

import { ScaleLevel } from '../../types'
import { Container } from './styles'

type Props = {
	timestamp: number
	scroll: number
	scaleLevel: ScaleLevel
	transitioning: boolean
}

export const TimeMarker = ({ timestamp, scroll, scaleLevel, transitioning }: Props) => {
	const calendar = useSelector(getWorldCalendarState)
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel, calendar })
	const offset = Math.round(realTimeToScaledTime(timestamp)) + scroll
	const theme = useCustomTheme()

	return <Container $theme={theme} $offset={offset} className={`${transitioning ? 'hidden' : ''}`} />
}
