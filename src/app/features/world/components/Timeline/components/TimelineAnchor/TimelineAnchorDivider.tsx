import { memo } from 'react'

import { Divider, DividerContainer, DividerLabel } from './styles'
import { TimelineAnchorSize, TimelineConstants } from './TimelineConstants'

type Props = {
	index: number
	offset: number
}

const getLoop = (index: number, offset: number) =>
	Math.abs(Math.floor((index * TimelineConstants.TimePerDivider + offset) / TimelineAnchorSize))

const TimelineAnchorDividerRaw = ({ index, offset }: Props) => {
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
		<DividerContainer
			key={index}
			offset={
				index * TimelineConstants.TimePerDivider +
				(offset >= 0 ? 0 : getLoop(index, offset) * TimelineAnchorSize)
			}
		>
			{index % 50 === 0 && (
				<DividerLabel>
					{index * TimelineConstants.TimePerDivider + getLoop(index, offset) * TimelineAnchorSize}
				</DividerLabel>
			)}
			<Divider height={getDividerHeight(index)} />
		</DividerContainer>
	)
}

export const TimelineAnchorDivider = memo(
	TimelineAnchorDividerRaw,
	(a, b) => getLoop(a.index, a.offset) === getLoop(b.index, b.offset)
)
