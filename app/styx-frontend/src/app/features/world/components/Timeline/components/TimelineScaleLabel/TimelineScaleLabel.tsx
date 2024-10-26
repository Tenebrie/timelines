import { Container, Label } from './styles'

type Props = {
	targetScaleIndex: number
	visible: boolean
}

export const TimelineScaleLabel = ({ targetScaleIndex, visible }: Props) => {
	const labels: Record<number, string> = {
		[-3]: '2 hours',
		[-2]: '6 hours',
		[-1]: '12 hours',
		0: '1 day',
		1: '2 days',
		2: '4 day',
		3: '1 week',
		4: '2 weeks',
		5: '4 weeks',
		6: '1 month',
		7: '2 months',
		9: '4 months',
		10: '1 year',
		11: '5 years',
		12: '10 years',
		13: '20 years',
		14: '60 years',
		15: '120 years',
		16: '250 years',
	}

	return (
		<Container className={visible ? 'visible' : ''}>
			{/* <LeftLabel fontSize={100}>{leftLabel}</LeftLabel> */}
			{/* <Label fontSize={100}>:</Label> */}
			{/* <RightLabel fontSize={100}>{rightLabel}</RightLabel> */}
			<Label fontSize={100}>{labels[targetScaleIndex]}</Label>
		</Container>
	)
}
