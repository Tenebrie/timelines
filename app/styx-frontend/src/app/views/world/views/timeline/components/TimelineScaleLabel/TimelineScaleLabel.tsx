import { memo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { Container, Label } from './styles'

const TimelineScaleLabelComponent = () => {
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const { targetScaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.targetScaleLevel === b.targetScaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)

	const worldCalendar = calendars[0] ?? {
		presentations: [],
	}
	const presentation = worldCalendar?.presentations[Number(targetScaleLevel + 1)] ?? {
		name: '',
	}

	return (
		<Container className={isSwitchingScale ? 'visible' : ''}>
			<Label fontSize={50}>{presentation.name}</Label>
		</Container>
	)
}

export const TimelineScaleLabel = memo(TimelineScaleLabelComponent)
