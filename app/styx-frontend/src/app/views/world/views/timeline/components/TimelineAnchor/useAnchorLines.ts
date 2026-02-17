import { WorldCalendarPresentationUnit } from '@api/types/worldTypes'
import { useCallback, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { EsotericDate } from '@/app/features/time/calendar/date/EsotericDate'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineAnchorPadding } from './TimelineAnchor'

type LabelSize = 'large' | 'medium' | 'small' | 'smallest'
type DividerData = {
	timestamp: number
	size: LabelSize
	unit: WorldCalendarPresentationUnit
	formatString: string
}

type Props = {
	containerWidth: number
}

export function useAnchorLines({ containerWidth }: Props) {
	const [dividers, setDividers] = useState<DividerData[][]>([[], [], [], []])
	const dividersRef = useRef(dividers)
	const { presentation } = useWorldTime()
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const worldCalendar = calendars[0]

	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })
	const lastSeenScrollRef = useRef(0)
	const lastSeenScaleLevelRef = useRef(TimelineState.scaleLevel)

	const stepDivider = useCallback(
		(
			date: EsotericDate,
			presentationUnit: WorldCalendarPresentationUnit,
			labelSize: LabelSize,
			direction = 1,
		) => {
			const timestamp = date.getTimestamp()
			const matchesIndices = (() => {
				if (presentationUnit.labeledIndices.length === 0) {
					return true
				}
				return presentationUnit.labeledIndices.includes(date.get(presentationUnit.unit)!.value)
			})()

			const steppedDate = date.step(presentationUnit.unit, presentationUnit.subdivision * direction)
			if (!matchesIndices) {
				return {
					date: steppedDate,
					divider: null,
				}
			}

			return {
				date: steppedDate,
				divider: {
					timestamp,
					size: labelSize,
					unit: presentationUnit,
					formatString: presentationUnit.formatString,
				},
			}
		},
		[],
	)

	const regenerateDividers = useCallback(
		(scroll: number) => {
			if (presentation.units.length === 0) {
				return
			}

			lastSeenScrollRef.current = scroll
			lastSeenScaleLevelRef.current = scaleLevel

			const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
			let baseDate = new EsotericDate(worldCalendar, currentTimestamp).floor(presentation.units[0].unit)
			const subdivision = presentation.units[0].subdivision
			const valueToStep = baseDate.get(presentation.units[0].unit)!.value % subdivision
			baseDate = baseDate.step(presentation.units[0].unit, -valueToStep - subdivision)

			const dividers: DividerData[][] = [[], [], [], []]
			const seenTimestamps = new Set<number>()
			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2)

			presentation.units.forEach((presentationUnit, outerIndex) => {
				const labelSize =
					outerIndex === 0 ? 'large' : outerIndex === 1 ? 'medium' : outerIndex === 2 ? 'small' : 'smallest'

				let date = new EsotericDate(baseDate)
				let lastLeftDate = null as EsotericDate | null
				// let lastRightDate = null as EsotericDate | null

				for (let i = 0; i < 1000; i++) {
					const timestamp = date.getTimestamp()
					if (timestamp < screenLeft) {
						const dist = screenLeft - timestamp
						if (dist > Number(presentationUnit.unit.duration) * presentationUnit.subdivision * 12) {
							date = date.step(presentationUnit.unit, presentationUnit.subdivision * 10)
						} else {
							date = date.step(presentationUnit.unit, presentationUnit.subdivision)
						}
						lastLeftDate = date
						continue
					}
					if (timestamp > screenRight) {
						if (dividers[outerIndex].length === 0 && lastLeftDate) {
							dividers[outerIndex].push({
								timestamp: lastLeftDate.getTimestamp(),
								size: labelSize,
								unit: presentationUnit,
								formatString: presentationUnit.formatString,
							})
						}
						break
					}

					const stepResult = stepDivider(date, presentationUnit, labelSize)
					date = stepResult.date
					if (stepResult.divider && !seenTimestamps.has(stepResult.divider.timestamp)) {
						dividers[outerIndex].push(stepResult.divider)
						seenTimestamps.add(stepResult.divider.timestamp)
					}

					if (i >= 900) {
						console.warn('Anchor close to overflow ', i)
					}
				}
			})
			setDividers(dividers)
			dividersRef.current = dividers
		},
		[containerWidth, presentation.units, scaledTimeToRealTime, stepDivider, worldCalendar, scaleLevel],
	)

	const updateDividers = useCallback(
		(scroll: number) => {
			if (
				dividersRef.current[0].length === 0 &&
				dividersRef.current[1].length === 0 &&
				dividersRef.current[2].length === 0 &&
				dividersRef.current[3].length === 0
			) {
				// regenerateDividers(scroll)
				return
			}

			if (
				Math.abs(scroll - lastSeenScrollRef.current) < 100 ||
				lastSeenScaleLevelRef.current !== scaleLevel
			) {
				return
			}

			const direction = scroll < lastSeenScrollRef.current ? 1 : -1
			lastSeenScrollRef.current = scroll

			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2 + 100)
			const screenWidthInPixels = scaledTimeToRealTime(containerWidth)
			const seenDividers = new Set<number>()
			dividersRef.current.forEach((dividerGroup) => {
				dividerGroup.forEach((divider) => {
					seenDividers.add(divider.timestamp)
				})
			})

			const newDividers: DividerData[][] = [
				[...dividersRef.current[0]],
				[...dividersRef.current[1]],
				[...dividersRef.current[2]],
				[...dividersRef.current[3]],
			]

			presentation.units.forEach((presentationUnit, outerIndex) => {
				const lastDividerIndex = direction === 1 ? newDividers[outerIndex].length - 1 : 0
				const lastDivider = newDividers[outerIndex][lastDividerIndex]
				if (!lastDivider) {
					return
					// throw new Error('No divider created for presentation level ' + outerIndex)
				}
				let date = new EsotericDate(worldCalendar, lastDivider.timestamp).step(
					presentationUnit.unit,
					presentationUnit.subdivision * direction,
				)

				if (direction === 1) {
					while (date.getTimestamp() < screenRight) {
						const stepResult = stepDivider(date, presentationUnit, lastDivider.size)
						date = stepResult.date
						const dist = screenRight - date.getTimestamp()
						if (Math.abs(dist) > screenWidthInPixels) {
							break
						}
						if (stepResult.divider && !seenDividers.has(stepResult.divider.timestamp)) {
							if (newDividers[outerIndex].length > 0 && newDividers[outerIndex][0].timestamp < screenLeft) {
								newDividers[outerIndex].shift()
							}
							newDividers[outerIndex].push(stepResult.divider)
							seenDividers.add(stepResult.divider.timestamp)
						}
					}
				} else {
					while (date.getTimestamp() > screenLeft) {
						const stepResult = stepDivider(date, presentationUnit, lastDivider.size, -1)
						date = stepResult.date
						const dist = screenLeft - date.getTimestamp()
						if (Math.abs(dist) > screenWidthInPixels) {
							break
						}
						if (stepResult.divider && !seenDividers.has(stepResult.divider.timestamp)) {
							if (
								newDividers[outerIndex].length > 0 &&
								newDividers[outerIndex][newDividers[outerIndex].length - 1].timestamp > screenRight
							) {
								newDividers[outerIndex].pop()
							}
							newDividers[outerIndex].unshift(stepResult.divider)
							seenDividers.add(stepResult.divider.timestamp)
						}
					}
				}
			})
			setDividers(newDividers)
			dividersRef.current = newDividers
		},
		[containerWidth, presentation.units, scaledTimeToRealTime, stepDivider, worldCalendar, scaleLevel],
	)

	return { dividers, regenerateDividers, updateDividers }
}
