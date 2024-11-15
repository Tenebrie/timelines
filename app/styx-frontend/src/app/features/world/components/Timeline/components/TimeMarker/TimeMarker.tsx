import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useCustomTheme } from '@/hooks/useCustomTheme'

import { ScaleLevel } from '../../types'
import { Container } from './styles'

type Props = {
	timestamp: number
	scroll: number
	mode: 'mouse' | 'outliner'
	scaleLevel: ScaleLevel
	transitioning: boolean
}

export const TimeMarker = ({ timestamp, scroll, scaleLevel, transitioning }: Props) => {
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })
	const offset = Math.round(realTimeToScaledTime(timestamp)) + scroll
	const theme = useCustomTheme()

	return <Container $theme={theme} $offset={offset} className={`${transitioning ? 'hidden' : ''}`} />
}
