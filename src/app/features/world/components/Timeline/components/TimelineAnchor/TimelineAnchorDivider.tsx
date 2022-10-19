import { memo, useState } from 'react'

import { Divider, DividerContainer, DividerLabel } from './styles'
import { TimelineConstants } from './TimelineConstants'

type Props = {
	index: number
	offset: number
	dividersToRender: number
	pixelsPerTime: number
	labelMultiplier: number
}

const getTimelineAnchorSize = (dividersToRender: number, labelMultiplier: number) =>
	(dividersToRender * TimelineConstants.TimePerDivider) / labelMultiplier

const getLoop = (
	index: number,
	offset: number,
	dividersToRender: number,
	pixelsPerTime: number,
	labelMultiplier: number
) =>
	Math.abs(
		Math.floor(
			((index * TimelineConstants.TimePerDivider) / labelMultiplier + offset * pixelsPerTime) /
				getTimelineAnchorSize(dividersToRender, labelMultiplier)
		)
	)

const TimelineAnchorDividerRaw = ({
	index,
	offset,
	dividersToRender,
	pixelsPerTime,
	labelMultiplier,
}: Props) => {
	const [lastDisplayedLabel, setLastDisplayedLabel] = useState<string | null>(null)

	const labelDisplayed =
		index % 50 === 0 ||
		(labelMultiplier === 0.000625 && pixelsPerTime === 1024 && index % 25 === 0) ||
		(labelMultiplier === 0.000625 && pixelsPerTime <= 512 && index % 10 === 0) ||
		(labelMultiplier === 0.000625 && pixelsPerTime <= 256 && index % 5 === 0) ||
		(labelMultiplier === 0.025 && pixelsPerTime === 32 && index % 25 === 0) ||
		(labelMultiplier === 0.025 && pixelsPerTime <= 16 && index % 10 === 0) ||
		(labelMultiplier === 0.025 && pixelsPerTime <= 8 && index % 5 === 0) ||
		(labelMultiplier === 1 && pixelsPerTime === 1 && index % 25 === 0) ||
		(labelMultiplier === 1 && pixelsPerTime <= 0.5 && index % 10 === 0) ||
		(labelMultiplier === 1 && pixelsPerTime <= 0.25 && index % 5 === 0)

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

	const loopIndex = getLoop(index, offset, dividersToRender, pixelsPerTime, labelMultiplier)
	const loopOffset = (loopIndex * getTimelineAnchorSize(dividersToRender, labelMultiplier)) / pixelsPerTime
	const dividerOffset = Math.round(
		(index * TimelineConstants.TimePerDivider) / labelMultiplier / pixelsPerTime + loopOffset
	)

	return (
		<DividerContainer key={index} offset={dividerOffset}>
			{index % 5 === 0 && (
				<DividerLabel className={labelDisplayed ? 'visible' : ''}>
					{((index + dividersToRender * loopIndex) * TimelineConstants.TimePerDivider) / labelMultiplier}
				</DividerLabel>
			)}
			<Divider height={getDividerHeight(index)} />
		</DividerContainer>
	)
}

export const TimelineAnchorDivider = memo(
	TimelineAnchorDividerRaw,
	(a, b) =>
		getLoop(a.index, a.offset, a.dividersToRender, a.pixelsPerTime, a.labelMultiplier) ===
			getLoop(b.index, b.offset, b.dividersToRender, b.pixelsPerTime, b.labelMultiplier) &&
		a.pixelsPerTime === b.pixelsPerTime
)
