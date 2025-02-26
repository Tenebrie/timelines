import { memo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { Container, Label } from './styles'

const TimelineScaleLabelComponent = () => {
	const { targetScaleLevel, isSwitchingScale } = useSelector(
		getTimelineState,
		(a, b) => a.targetScaleLevel === b.targetScaleLevel && a.isSwitchingScale === b.isSwitchingScale,
	)

	const labels: Record<number, string> = {
		[-1]: 'Minutes',
		0: 'Hours',
		1: 'Days',
		2: 'Weeks',
		3: 'Months',
		4: 'Years',
		5: 'Decades',
		6: 'Centuries',
		7: 'Millenia',
	}

	return (
		<Container className={isSwitchingScale ? 'visible' : ''}>
			<Label fontSize={50}>{labels[targetScaleLevel]}</Label>
		</Container>
	)
}

export const TimelineScaleLabel = memo(TimelineScaleLabelComponent)
