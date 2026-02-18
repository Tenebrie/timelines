import { WorldCalendarPresentation, WorldCalendarPresentationUnit } from '@api/types/worldTypes'
import { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { EsotericDate } from '@/app/features/time/calendar/date/EsotericDate'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../../utils/TimelineState'
import { TimelineAnchorPadding } from './TimelineAnchor'
import { SlotData } from './TimelineAnchorSlot'

type LabelSize = 'large' | 'medium' | 'small' | 'smallest'
type DividerData = {
	timestamp: number
	size: LabelSize
	unit: WorldCalendarPresentationUnit
	followerCount: number
	followerSpacing: number
	followerDuration: number
	formatString: string
}

type Props = {
	containerWidth: number
}

export const anchorSlotIds = Array.from({ length: 150 }, (_, i) => i)

export function useAnchorLines({ containerWidth }: Props) {
	const dividers = useRef<DividerData[][]>([[], [], [], []])
	const renderedDividersRef = useRef<DividerData[]>([])
	const baseDateRef = useRef<EsotericDate | null>(null)
	const { presentation } = useWorldTime()
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)
	const worldCalendar = calendars[0]

	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })
	const lastSeenScrollRef = useRef(0)
	const lastSeenScaleLevelRef = useRef(TimelineState.scaleLevel)

	// Slot management refs
	const slotAssignmentsRef = useRef(new Map<number, SlotData | null>())
	const timestampToSlotRef = useRef(new Map<number, number>())
	const freeSlotsRef = useRef(new Set<number>(anchorSlotIds))

	const emitSlotUpdate = useEventBusDispatch['timeline/anchor/updateSlot']()

	// Sync slots with dividers - called directly, no React state involved
	const syncSlots = useCallback(
		(newDividers: DividerData[]) => {
			const newTimestamps = new Set(newDividers.map((d) => d.timestamp))

			// Find slots to free (dividers that no longer exist)
			for (const [timestamp, slotId] of timestampToSlotRef.current) {
				if (!newTimestamps.has(timestamp)) {
					// Free this slot
					freeSlotsRef.current.add(slotId)
					timestampToSlotRef.current.delete(timestamp)
					slotAssignmentsRef.current.set(slotId, null)
					emitSlotUpdate({ slotId, data: null })
				}
			}

			// Assign slots to new dividers or update existing ones
			for (const div of newDividers) {
				const existingSlot = timestampToSlotRef.current.get(div.timestamp)
				const slotData: SlotData = {
					timestamp: div.timestamp,
					size: div.size,
					formatString: div.formatString,
					followerCount: div.followerCount,
					followerSpacing: div.followerSpacing,
				}

				if (existingSlot !== undefined) {
					// Check if data changed
					const currentData = slotAssignmentsRef.current.get(existingSlot)
					if (
						currentData &&
						currentData.timestamp === slotData.timestamp &&
						currentData.size === slotData.size &&
						currentData.formatString === slotData.formatString &&
						currentData.followerCount === slotData.followerCount &&
						currentData.followerSpacing === slotData.followerSpacing
					) {
						continue // No change, skip update
					}
					slotAssignmentsRef.current.set(existingSlot, slotData)
					emitSlotUpdate({ slotId: existingSlot, data: slotData })
				} else {
					// Need a new slot
					const freeSlot = freeSlotsRef.current.values().next().value
					if (freeSlot === undefined) {
						console.warn('No free slots available!')
						continue
					}
					freeSlotsRef.current.delete(freeSlot)
					timestampToSlotRef.current.set(div.timestamp, freeSlot)
					slotAssignmentsRef.current.set(freeSlot, slotData)
					emitSlotUpdate({ slotId: freeSlot, data: slotData })
				}
			}
		},
		[emitSlotUpdate],
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
		return flatDividers
			.map((div, index) => {
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
					followerDuration: subdividedFollowerDuration,
				}
			})
			.sort((a, b) => a.timestamp - b.timestamp)
	}, [])

	const flushDividers = useCallback(
		(divs: DividerData[][]) => {
			dividers.current = divs
			const flatDivs = flattenDividers(presentation, divs)
			renderedDividersRef.current = flatDivs

			// Sync slots directly - no React state involved
			syncSlots(flatDivs)

			const divsWithFollowers: number[] = []
			flatDivs.forEach((div) => {
				divsWithFollowers.push(div.timestamp)
				for (let i = 0; i < div.followerCount; i++) {
					divsWithFollowers.push(div.timestamp + (i + 1) * div.followerDuration)
				}
			})

			console.log(divsWithFollowers)
			TimelineState.anchorTimestamps = divsWithFollowers
		},
		[flattenDividers, presentation, syncSlots],
	)

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
					followerDuration: 0,
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

			flushDividers(dividers)
		},
		[
			presentation.units,
			scaleLevel,
			scaledTimeToRealTime,
			worldCalendar,
			containerWidth,
			flushDividers,
			stepDivider,
		],
	)

	const updateDividers = useCallback(
		(scroll: number) => {
			if (
				dividers.current[0].length === 0 &&
				dividers.current[1].length === 0 &&
				dividers.current[2].length === 0 &&
				dividers.current[3].length === 0
			) {
				return
			}

			const scrollDiff = Math.abs(scroll - lastSeenScrollRef.current)
			if (scrollDiff < 100 || lastSeenScaleLevelRef.current !== scaleLevel) {
				return
			}

			const direction = scroll < lastSeenScrollRef.current ? 1 : -1
			if (scrollDiff > 2000) {
				regenerateDividers(scroll)
				return
			}

			lastSeenScrollRef.current = scroll

			const screenLeft = scaledTimeToRealTime(-scroll - TimelineAnchorPadding)
			const screenRight = screenLeft + scaledTimeToRealTime(containerWidth + TimelineAnchorPadding * 2 + 100)
			const screenWidthInPixels = scaledTimeToRealTime(containerWidth)
			const newDividers: DividerData[][] = [
				[...dividers.current[0]],
				[...dividers.current[1]],
				[...dividers.current[2]],
				[...dividers.current[3]],
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

			flushDividers(newDividers)
		},
		[
			scaleLevel,
			scaledTimeToRealTime,
			containerWidth,
			presentation.units,
			flushDividers,
			regenerateDividers,
			worldCalendar,
			stepDivider,
		],
	)

	return { regenerateDividers, updateDividers }
}
