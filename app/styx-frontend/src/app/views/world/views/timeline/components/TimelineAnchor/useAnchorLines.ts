import { WorldCalendarPresentation, WorldCalendarPresentationUnit } from '@api/types/worldTypes'
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
	followerCount: number
	followerSpacing: number
	formatString: string
}

type Props = {
	containerWidth: number
}

export function useAnchorLines({ containerWidth }: Props) {
	const [dividers, setDividers] = useState<DividerData[][]>([[], [], [], []])
	const [renderedDividers, setRenderedDividers] = useState<DividerData[]>([])
	const dividersRef = useRef(dividers)
	const baseDateRef = useRef<EsotericDate | null>(null)
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
					followerCount: 0,
					followerSpacing: 0,
					formatString: presentationUnit.formatString,
				},
			}
		},
		[],
	)

	const flattenDividers = useCallback((presentation: WorldCalendarPresentation, divs: DividerData[][]) => {
		const flatDivs = divs.flat()
		if (flatDivs.length === 0) {
			return []
		}
		const smallDivider = (() => {
			const small = flatDivs.find((d) => d.size === 'small')
			if (small) {
				return small
			}
			const medium = flatDivs.find((d) => d.size === 'medium')
			if (medium) {
				return medium
			}
			const large = flatDivs.find((d) => d.size === 'large')
			if (large) {
				return large
			}
			throw new Error('No suitable divider found')
		})()

		const subdividedFollowerDuration = presentation.compression * Number(smallDivider.unit.unit.duration)

		const flatDividers = flatDivs.sort((a, b) => a.timestamp - b.timestamp)
		return flatDividers.map((div, index) => {
			const next = flatDividers[index + 1]
			if (!next) {
				return div
			}

			const timeToNext = Math.abs(next.timestamp - div.timestamp)

			const rawFollowerCount = Math.round(timeToNext / subdividedFollowerDuration) - 1
			const followerCount = Math.min(50, rawFollowerCount)
			return {
				...div,
				followerCount: followerCount,
				followerSpacing: timeToNext / (followerCount + 1),
			}
		})
	}, [])

	const regenerateDividers = useCallback(
		(scroll: number) => {
			if (presentation.units.length === 0) {
				return
			}

			lastSeenScrollRef.current = scroll
			lastSeenScaleLevelRef.current = scaleLevel

			const currentTimestamp = scaledTimeToRealTime(-scroll + 40)
			let baseDate = new EsotericDate(worldCalendar, currentTimestamp).floor(presentation.units[0].unit)
			baseDateRef.current = new EsotericDate(baseDate)
			const subdivision = presentation.units[0].subdivision
			const entry = baseDate.get(presentation.units[0].unit)!
			const valueToStep = ((entry.value % subdivision) + subdivision) % subdivision
			baseDate = baseDate.step(presentation.units[0].unit, -valueToStep - subdivision)

			const dividers: DividerData[][] = [[], [], [], []]
			const seenTimestamps = new Set<number>()
			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2)

			presentation.units.forEach((presentationUnit, outerIndex) => {
				const labelSize =
					outerIndex === 0 ? 'large' : outerIndex === 1 ? 'medium' : outerIndex === 2 ? 'small' : 'smallest'

				let date = new EsotericDate(baseDate)

				for (let i = 0; i < 1000; i++) {
					const timestamp = date.getTimestamp()
					if (timestamp < screenLeft) {
						const dist = screenLeft - timestamp
						if (dist > Number(presentationUnit.unit.duration) * presentationUnit.subdivision * 12) {
							date = date.step(presentationUnit.unit, presentationUnit.subdivision * 10)
						} else {
							date = date.step(presentationUnit.unit, presentationUnit.subdivision)
						}
						continue
					}
					if (timestamp > screenRight) {
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
			setRenderedDividers(flattenDividers(presentation, dividers))
			dividersRef.current = dividers
		},
		[
			presentation,
			scaleLevel,
			scaledTimeToRealTime,
			worldCalendar,
			containerWidth,
			flattenDividers,
			stepDivider,
		],
	)

	const updateDividers = useCallback(
		(scroll: number) => {
			if (
				dividersRef.current[0].length === 0 &&
				dividersRef.current[1].length === 0 &&
				dividersRef.current[2].length === 0 &&
				dividersRef.current[3].length === 0
			) {
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
			const newDividers: DividerData[][] = [
				[...dividersRef.current[0]],
				[...dividersRef.current[1]],
				[...dividersRef.current[2]],
				[...dividersRef.current[3]],
			]

			presentation.units.forEach((presentationUnit, outerIndex) => {
				const labelSize =
					outerIndex === 0 ? 'large' : outerIndex === 1 ? 'medium' : outerIndex === 2 ? 'small' : 'smallest'
				const lastDividerIndex = direction === 1 ? newDividers[outerIndex].length - 1 : 0
				const lastDivider = newDividers[outerIndex][lastDividerIndex]
				let lastDividerTimestamp: number
				if (lastDivider) {
					lastDividerTimestamp = lastDivider.timestamp
				} else {
					lastDividerTimestamp = baseDateRef.current?.getTimestamp() ?? 0
				}
				let date = new EsotericDate(worldCalendar, lastDividerTimestamp)
				if (lastDivider) {
					date = date.step(presentationUnit.unit, presentationUnit.subdivision * direction)
				}

				if (direction === 1) {
					while (date.getTimestamp() < screenRight) {
						const stepResult = stepDivider(date, presentationUnit, labelSize)
						date = stepResult.date
						const dist = screenRight - date.getTimestamp()
						if (Math.abs(dist) > screenWidthInPixels * 100) {
							break
						}
						if (stepResult.divider) {
							if (newDividers[outerIndex].length > 1 && newDividers[outerIndex][0].timestamp < screenLeft) {
								newDividers[outerIndex].shift()
							}
							newDividers[outerIndex].push(stepResult.divider)
						}
					}
				} else {
					while (date.getTimestamp() > screenLeft) {
						const stepResult = stepDivider(date, presentationUnit, labelSize, -1)
						date = stepResult.date
						const dist = screenLeft - date.getTimestamp()
						if (Math.abs(dist) > screenWidthInPixels * 100) {
							break
						}
						if (stepResult.divider) {
							if (
								newDividers[outerIndex].length > 1 &&
								newDividers[outerIndex][newDividers[outerIndex].length - 1].timestamp > screenRight
							) {
								newDividers[outerIndex].pop()
							}
							newDividers[outerIndex].unshift(stepResult.divider)
						}
					}
				}
			})

			const claimedTimestamps = new Set<number>()
			for (let lvl = 0; lvl < newDividers.length; lvl++) {
				newDividers[lvl] = newDividers[lvl].filter((d) => {
					if (claimedTimestamps.has(d.timestamp)) {
						return false
					}
					claimedTimestamps.add(d.timestamp)
					return true
				})
			}

			setDividers(newDividers)
			setRenderedDividers(flattenDividers(presentation, newDividers))
			dividersRef.current = newDividers
		},
		[
			scaleLevel,
			scaledTimeToRealTime,
			containerWidth,
			presentation,
			flattenDividers,
			worldCalendar,
			stepDivider,
		],
	)

	return { dividers: renderedDividers, regenerateDividers, updateDividers }
}
