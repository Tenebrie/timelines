import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useCurrentTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { useUpdateEventDebounced } from '@/app/views/world/api/useUpdateEventDebounced'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import useEventTracks from '../hooks/useEventTracks'
import { TimelineState } from '../utils/TimelineState'

export function TimelineHotkeys() {
	const { tracks } = useEventTracks()
	const { selectedTimelineMarkers, events } = useSelector(
		getWorldState,
		(a, b) => a.selectedTimelineMarkers === b.selectedTimelineMarkers && a.events === b.events,
	)
	const [updateEvent] = useUpdateEventDebounced()

	const { realTimeToScaledTime } = useCurrentTimelineWorldTime()
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	useShortcut(
		Shortcut.AscendMarkerTrack,
		() => {
			const marker = selectedTimelineMarkers[0]
			if (!marker) {
				return
			}

			const event = events.find((e) => e.id === marker.eventId)
			if (!event) {
				return
			}

			const currentTrackIndex = event.worldEventTrackId
				? tracks.findIndex((t) => t.id === event.worldEventTrackId)
				: 0

			const targetTrack = tracks[Math.min(currentTrackIndex + 1, tracks.length - 1)]
			updateEvent(event.id, { worldEventTrackId: targetTrack.id === 'default' ? null : targetTrack.id })
		},
		selectedTimelineMarkers.length > 0,
	)

	useShortcut(
		Shortcut.DescendMarkerTrack,
		() => {
			const marker = selectedTimelineMarkers[0]
			if (!marker) {
				return
			}

			const event = events.find((e) => e.id === marker.eventId)
			if (!event) {
				return
			}

			const currentTrackIndex = event.worldEventTrackId
				? tracks.findIndex((t) => t.id === event.worldEventTrackId)
				: 0

			const targetTrack = tracks[Math.max(currentTrackIndex - 1, 0)]
			updateEvent(event.id, { worldEventTrackId: targetTrack.id === 'default' ? null : targetTrack.id })
		},
		selectedTimelineMarkers.length > 0,
	)

	const nudgeMarker = useCallback(
		(step: number) => {
			const startingMarker = selectedTimelineMarkers[0]
			if (!startingMarker) {
				return
			}

			const event = events.find((e) => e.id === startingMarker.eventId)
			if (!event) {
				return
			}

			const allMarkers = [`issuedAt-${event.id}`]
			if (event.revokedAt) {
				allMarkers.push(`revokedAt-${event.id}`)
			}

			const [marker, pushingBoth] = (() => {
				if (allMarkers.every((m) => selectedTimelineMarkers.map((marker) => marker.key).includes(m))) {
					if (step > 0) {
						return [
							{
								key: allMarkers[1],
								eventId: startingMarker.eventId,
							},
							true,
						] as const
					} else {
						return [
							{
								key: allMarkers[0],
								eventId: startingMarker.eventId,
							},
							true,
						] as const
					}
				}
				return [startingMarker, false] as const
			})()

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
				if (step === -1 && nearestDivider < currentTimestamp && Math.abs(pixelDist) > 1) {
					return nearestDivider
				}
				if (step === 1 && nearestDivider > currentTimestamp && Math.abs(pixelDist) > 1) {
					return nearestDivider
				}
				const dividerIndex = TimelineState.anchorTimestamps.indexOf(nearestDivider)
				if (dividerIndex === -1) {
					return currentTimestamp
				}
				return TimelineState.anchorTimestamps[
					Math.max(0, Math.min(dividerIndex + step, TimelineState.anchorTimestamps.length - 1))
				]
			})()

			if (pushingBoth) {
				const pushDiff = targetTimestamp - currentTimestamp
				updateEvent(event.id, {
					timestamp: event.timestamp + pushDiff,
					revokedAt: event.revokedAt ? event.revokedAt + pushDiff : undefined,
				})
			} else if (marker.key.startsWith('issuedAt-') && targetTimestamp < (event.revokedAt ?? Infinity)) {
				updateEvent(event.id, { timestamp: targetTimestamp, revokedAt: event.revokedAt })
			} else if (marker.key.startsWith('revokedAt-') && targetTimestamp > event.timestamp) {
				updateEvent(event.id, { revokedAt: targetTimestamp, timestamp: event.timestamp })
			}

			const screenLeft = -TimelineState.scroll + 100
			const screenRight = -TimelineState.scroll + TimelineState.width - 100
			const currentTimestampOnScreen = realTimeToScaledTime(currentTimestamp)
			if (step < 0 && currentTimestampOnScreen < screenLeft) {
				const diff = -currentTimestampOnScreen + screenLeft
				setTimeout(() => {
					scrollTimelineTo({
						rawScrollValue: TimelineState.scroll + diff,
						skipAnim: true,
					})
				})
			}
			if (step > 0 && currentTimestampOnScreen > screenRight) {
				const diff = currentTimestampOnScreen - screenRight
				setTimeout(() => {
					scrollTimelineTo({
						rawScrollValue: TimelineState.scroll - diff,
						skipAnim: true,
					})
				})
			}
		},
		[events, realTimeToScaledTime, scrollTimelineTo, selectedTimelineMarkers, updateEvent],
	)

	useShortcut(
		Shortcut.NudgeLeft,
		() => {
			nudgeMarker(-1)
		},
		selectedTimelineMarkers.length > 0,
	)
	useShortcut(
		Shortcut.LargeNudgeLeft,
		() => {
			nudgeMarker(-3)
		},
		selectedTimelineMarkers.length > 0,
	)

	useShortcut(
		Shortcut.NudgeRight,
		() => {
			nudgeMarker(1)
		},
		selectedTimelineMarkers.length > 0,
	)
	useShortcut(
		Shortcut.LargeNudgeRight,
		() => {
			nudgeMarker(3)
		},
		selectedTimelineMarkers.length > 0,
	)

	return null
}
