import { Divider } from './styles'

type Props = {
	offset: number
}

const TimelineAnchor = ({ offset }: Props) => {
	const dividers = Array(200).fill(null)

	const getDividerHeight = (index: number) => {
		if (index % 50 === 0) {
			return 3
		} else if (index % 10 === 0) {
			return 2
		} else if (index % 5 === 0) {
			return 1.5
		}
		return 1
	}

	return (
		<>
			{dividers.map((_, index) => (
				<Divider key={index} offset={offset + index * 16} height={getDividerHeight(index)} />
			))}
		</>
	)
}

export default TimelineAnchor
