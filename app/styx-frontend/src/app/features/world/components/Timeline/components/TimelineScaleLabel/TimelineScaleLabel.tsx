import { Container, LeftLabel, RightLabel } from './styles'

type Props = {
	targetScaleIndex: number
	visible: boolean
}

export const TimelineScaleLabel = ({ targetScaleIndex, visible }: Props) => {
	const leftLabel = targetScaleIndex > 0 ? Math.pow(2, targetScaleIndex) : 1
	const rightLabel = targetScaleIndex < 0 ? Math.pow(2, -targetScaleIndex) : 1

	return (
		<Container className={visible ? 'visible' : ''}>
			<LeftLabel>{leftLabel}</LeftLabel>:<RightLabel>{rightLabel}</RightLabel>
		</Container>
	)
}
