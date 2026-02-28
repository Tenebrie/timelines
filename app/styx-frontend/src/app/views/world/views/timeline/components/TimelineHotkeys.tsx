import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useCurrentTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { useUpdateEventDebounced } from '@/app/views/world/api/useUpdateEventDebounced'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineState } from '../utils/TimelineState'

export function TimelineHotkeys() {
	const { selectedTimelineMarkers, events } = useSelector(
		getWorldState,
		(a, b) => a.selectedTimelineMarkers === b.selectedTimelineMarkers && a.events === b.events,
	)
	const [updateEvent] = useUpdateEventDebounced()

	const { realTimeToScaledTime } = useCurrentTimelineWorldTime()
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	useShortcut(
		Shortcut.NudgeLeft,
		() => {
			const marker = selectedTimelineMarkers[0]
			if (!marker) {
				return
			}

			const event = events.find((e) => e.id === marker.eventId)
			if (!event) {
				return
			}

			const currentTimestamp = (() => {
				if (marker.key.startsWith('issuedAt-')) {
					return event.timestamp
				} else if (marker.key.startsWith('revokedAt-')) {
					return event.revokedAt!
				}
				return event.timestamp
			})()

			const nearestDivider = binarySearchForClosest(TimelineState.anchorTimestamps, currentTimestamp)
			const pixelDist = realTimeToScaledTime(nearestDivider - currentTimestamp)
			const targetTimestamp = (() => {
				if (nearestDivider < currentTimestamp && pixelDist < 1) {
					return nearestDivider
				}
				const dividerIndex = TimelineState.anchorTimestamps.indexOf(nearestDivider)
				if (dividerIndex === -1 || dividerIndex === 0) {
					return currentTimestamp
				}
				return TimelineState.anchorTimestamps[dividerIndex - 1]
			})()

			if (marker.key.startsWith('issuedAt-')) {
				updateEvent(event.id, { timestamp: targetTimestamp })
			} else if (marker.key.startsWith('revokedAt-')) {
				updateEvent(event.id, { revokedAt: targetTimestamp })
			}

			const screenLeft = -TimelineState.scroll + 100
			const currentTimestampOnScreen = realTimeToScaledTime(currentTimestamp)
			if (currentTimestampOnScreen < screenLeft) {
				const diff = -currentTimestampOnScreen + screenLeft
				scrollTimelineTo({
					rawScrollValue: TimelineState.scroll + diff,
					skipAnim: true,
				})
			}
		},
		selectedTimelineMarkers.length > 0,
	)

	useShortcut(
		Shortcut.NudgeRight,
		() => {
			const marker = selectedTimelineMarkers[0]
			if (!marker) {
				return
			}

			const event = events.find((e) => e.id === marker.eventId)
			if (!event) {
				return
			}

			const currentTimestamp = (() => {
				if (marker.key.startsWith('issuedAt-')) {
					return event.timestamp
				} else if (marker.key.startsWith('revokedAt-')) {
					return event.revokedAt!
				}
				return event.timestamp
			})()

			const nearestDivider = binarySearchForClosest(TimelineState.anchorTimestamps, currentTimestamp)
			const pixelDist = realTimeToScaledTime(nearestDivider - currentTimestamp)
			const targetTimestamp = (() => {
				if (nearestDivider > currentTimestamp && pixelDist > 1) {
					return nearestDivider
				}
				const dividerIndex = TimelineState.anchorTimestamps.indexOf(nearestDivider)
				if (dividerIndex === -1 || dividerIndex === TimelineState.anchorTimestamps.length - 1) {
					return currentTimestamp
				}
				return TimelineState.anchorTimestamps[dividerIndex + 1]
			})()

			if (marker.key.startsWith('issuedAt-')) {
				updateEvent(event.id, { timestamp: targetTimestamp })
			} else if (marker.key.startsWith('revokedAt-')) {
				updateEvent(event.id, { revokedAt: targetTimestamp })
			}

			const screenRight = -TimelineState.scroll + TimelineState.width - 100
			const currentTimestampOnScreen = realTimeToScaledTime(currentTimestamp)
			if (currentTimestampOnScreen > screenRight) {
				const diff = currentTimestampOnScreen - screenRight
				scrollTimelineTo({
					rawScrollValue: TimelineState.scroll - diff,
					skipAnim: true,
				})
			}
		},
		selectedTimelineMarkers.length > 0,
	)

	return null
}
