import { useTimelineWorldTime } from '../../../../../time/hooks/useTimelineWorldTime'
import { ScaleLevel } from '../../types'
import { Container } from './styles'

type Props = {
	timestamp: number
	scroll: number
	timelineScale: number
	mode: 'mouse' | 'outliner'
	scaleLevel: ScaleLevel
	transitioning: boolean
}

export const TimeMarker = ({ timestamp, scroll, timelineScale, scaleLevel, transitioning }: Props) => {
	const { realTimeToScaledTime } = useTimelineWorldTime({ scaleLevel })
	const offset = Math.round(realTimeToScaledTime(timestamp / timelineScale)) + scroll
	return <Container offset={offset} className={`${transitioning ? 'hidden' : ''}`} />
}
