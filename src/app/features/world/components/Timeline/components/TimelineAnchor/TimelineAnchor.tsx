import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorDivider } from './TimelineAnchorDivider'
import { TimelineConstants } from './TimelineConstants'

type Props = {
	offset: number
}

export const TimelineAnchor = ({ offset }: Props) => {
	const dividers = Array(TimelineConstants.DividersToRender).fill(null)

	return (
		<TimelineAnchorContainer offset={offset}>
			{dividers.map((_, index) => (
				<TimelineAnchorDivider key={index} offset={offset} index={index} />
			))}
		</TimelineAnchorContainer>
	)
}
