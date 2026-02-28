import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useCurrentTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { useAutoRef } from '@/app/hooks/useAutoRef'
import { timelineSlice } from '@/app/views/world/views/timeline/TimelineSlice'

import useEventTracks, { TimelineTrack } from '../../hooks/useEventTracks'

export const TimelineTrackReporter = () => {
	const data = useEventTracks()
	const { scaledTimeToRealTime } = useCurrentTimelineWorldTime()

	const { setTracks } = timelineSlice.actions
	const dispatch = useDispatch()

	const tracksRef = useAutoRef(data)

	/**
	 * Compares two arrays of TimelineTrack and determines if an incremental update is possible.
	 * Incremental means all markerPosition changes are within a threshold.
	 * Returns an array of entities to update if incremental, or null if not.
	 */

	// Store accumulated marker movement between hard flushes
	const markerMoveAccumulator = useMemo(() => new Map<string, number>(), [])

	const isIncrementalUpdate = useCallback(
		(previous: TimelineTrack[], current: TimelineTrack[]) => {
			const threshold = scaledTimeToRealTime(1500) // 500px threshold in time units
			if (previous.length !== current.length) {
				markerMoveAccumulator.clear()
				return null
			}
			const updates: TimelineEntity<MarkerType>[] = []
			let shouldFlush = false
			for (let i = 0; i < previous.length; i++) {
				const trackA = previous[i]
				const trackB = current[i]
				if (!trackB || trackA.id !== trackB.id) {
					markerMoveAccumulator.clear()
					return null
				}
				if (trackA.events.length !== trackB.events.length) {
					markerMoveAccumulator.clear()
					return null
				}
				for (let j = 0; j < trackA.events.length; j++) {
					const eventA = trackA.events[j]
					const eventB = trackB.events[j]
					if (!eventB || eventA.key !== eventB.key) {
						markerMoveAccumulator.clear()
						return null
					}
					if (eventA.markerHeight !== eventB.markerHeight) {
						markerMoveAccumulator.clear()
						return null
					}
					if (eventA.markerPosition !== eventB.markerPosition) {
						const diff = Math.abs(eventA.markerPosition - eventB.markerPosition)
						const accKey = `${trackA.id}:${eventA.key}`
						const prevAccum = markerMoveAccumulator.get(accKey) ?? 0
						const newAccum = prevAccum + diff
						markerMoveAccumulator.set(accKey, newAccum)
						if (newAccum > threshold) {
							shouldFlush = true
						}
						updates.push(eventB)
					} else {
						// Reset accumulator if no movement
						markerMoveAccumulator.set(`${trackA.id}:${eventA.key}`, 0)
					}
				}
			}
			if (shouldFlush) {
				markerMoveAccumulator.clear()
				return null
			}
			return updates.length > 0 ? updates : null
		},
		[markerMoveAccumulator, scaledTimeToRealTime],
	)

	const updateMarker = useEventBusDispatch['timeline/marker/incrementalUpdate']()

	useEffect(() => {
		const incrementalUpdates = isIncrementalUpdate(tracksRef.previous?.tracks ?? [], data.tracks)
		if (tracksRef.previous?.isLoading === data.isLoading && incrementalUpdates) {
			incrementalUpdates.forEach((marker) => {
				updateMarker(marker)
			})
			return
		}
		dispatch(setTracks(data))
	}, [data, dispatch, updateMarker, isIncrementalUpdate, setTracks, tracksRef])

	return null
}
