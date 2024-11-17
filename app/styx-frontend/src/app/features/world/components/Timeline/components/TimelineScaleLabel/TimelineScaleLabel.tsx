import { memo } from 'react'

import { Container, Label } from './styles'

type Props = {
	targetScaleIndex: number
	visible: boolean
}

const TimelineScaleLabelComponent = ({ targetScaleIndex, visible }: Props) => {
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
		<Container className={visible ? 'visible' : ''}>
			<Label fontSize={50}>{labels[targetScaleIndex]}</Label>
		</Container>
	)
}

export const TimelineScaleLabel = memo(TimelineScaleLabelComponent)
