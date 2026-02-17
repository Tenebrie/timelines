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
			lastSeenScaleLevelRef.current = TimelineState.scaleLevel
			console.log('Regenerate dividers at ', scroll)

			const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
			let baseDate = new EsotericDate(worldCalendar, currentTimestamp).floor(presentation.units[0].unit)
			console.log(baseDate.getTimestamp())
			const subdivision = presentation.units[0].subdivision
			const valueToStep = baseDate.get(presentation.units[0].unit)!.value % subdivision
			baseDate = baseDate.step(presentation.units[0].unit, -valueToStep - subdivision)

			const dividers: DividerData[][] = [[], [], [], []]
			const seenTimestamps = new Set<number>()
			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2)
			console.log(screenLeft)

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
						// if (dividers[outerIndex].length === 0 && lastLeftDate) {
						// 	dividers[outerIndex].push({
						// 		timestamp: lastLeftDate.getTimestamp(),
						// 		size: labelSize,
						// 		unit: presentationUnit,
						// 		formatString: presentationUnit.formatString,
						// 	})
						// }
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
		[containerWidth, presentation.units, scaledTimeToRealTime, stepDivider, worldCalendar],
	)

	const updateDividers = useCallback(
		(scroll: number) => {
			if (
				dividers[0].length === 0 &&
				dividers[1].length === 0 &&
				dividers[2].length === 0 &&
				dividers[3].length === 0
			) {
				// regenerateDividers(scroll)
				return
			}

			if (Math.abs(scroll - lastSeenScrollRef.current) < 20) {
				console.log('DIFF', Math.abs(scroll - lastSeenScrollRef.current))
				return
			}
			console.log('UPDATE', scroll, lastSeenScrollRef.current)

			const direction = scroll < lastSeenScrollRef.current ? 1 : -1
			lastSeenScrollRef.current = scroll

			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2 + 100)
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
					for (let i = 0; i < 10; i++) {
						const stepResult = stepDivider(date, presentationUnit, lastDivider.size)
						date = stepResult.date
						if (stepResult.divider && !seenDividers.has(stepResult.divider.timestamp)) {
							if (newDividers[outerIndex].length > 0 && newDividers[outerIndex][0].timestamp < screenLeft) {
								newDividers[outerIndex].shift()
							}
							console.log('Adding right')
							newDividers[outerIndex].push(stepResult.divider)
							seenDividers.add(stepResult.divider.timestamp)
						}
						if (stepResult.date.getTimestamp() > screenRight) {
							break
						}
					}
				} else {
					date = date.step(presentationUnit.unit, presentationUnit.subdivision * -9)
					for (let i = 0; i < 15; i++) {
						const stepResult = stepDivider(date, presentationUnit, lastDivider.size, 1)
						date = stepResult.date
						if (stepResult.date.getTimestamp() < screenLeft) {
							continue
						}
						if (stepResult.divider && !seenDividers.has(stepResult.divider.timestamp)) {
							if (
								newDividers[outerIndex].length > 0 &&
								newDividers[outerIndex][newDividers[outerIndex].length - 1].timestamp > screenRight
							) {
								newDividers[outerIndex].pop()
							}
							console.log('Adding left')
							newDividers[outerIndex].unshift(stepResult.divider)
							seenDividers.add(stepResult.divider.timestamp)
						}
					}
					newDividers[outerIndex].sort((a, b) => a.timestamp - b.timestamp)
				}
			})
			setDividers(newDividers)
			dividersRef.current = newDividers
		},
		[containerWidth, dividers, presentation.units, scaledTimeToRealTime, stepDivider, worldCalendar],
	)

	return { dividers, regenerateDividers, updateDividers }
}
