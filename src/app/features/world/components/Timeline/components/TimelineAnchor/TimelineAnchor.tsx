import { TimelineAnchorContainer } from './styles'
import { TimelineAnchorDivider } from './TimelineAnchorDivider'
import { TimelineConstants } from './TimelineConstants'

type Props = {
	offset: number
	pixelsPerTime: number
	labelMultiplier: number
}

export const TimelineAnchor = ({ offset, pixelsPerTime, labelMultiplier }: Props) => {
	const dividersToRender = Math.ceil(
		Math.ceil(
			((window.screen.width / TimelineConstants.TimePerDivider) * labelMultiplier * pixelsPerTime) / 50
		) * 50
	)
	const dividers = Array(dividersToRender).fill(null)

	return (
		<TimelineAnchorContainer offset={offset}>
			{dividers.map((_, index) => (
				<TimelineAnchorDivider
					key={index}
					offset={offset}
					index={index}
					dividersToRender={dividersToRender}
					pixelsPerTime={pixelsPerTime}
					labelMultiplier={labelMultiplier}
				/>
			))}
		</TimelineAnchorContainer>
	)
}
