import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import { RefObject, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { useUpdateWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { binarySearchForClosest } from '@/app/utils/binarySearchForClosest'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { TimelineEventHeightPx, TimelineTrack } from '@/app/views/world/views/timeline/hooks/useEventTracks'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getTimelineState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	track: TimelineTrack
	receiverRef?: RefObject<HTMLDivElement | null>
}

export const useEventDragDropReceiver = ({ track, receiverRef }: Props) => {
	const { id: worldId, events } = useSelector(getWorldState, (a, b) => a.id === b.id && a.events === b.events)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const [updateWorldEvent] = useUpdateWorldEventMutation()
	const [updateWorldEventDelta] = useUpdateWorldEventDeltaMutation()
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const { updateEvent, updateEventDelta } = worldSlice.actions
	const dispatch = useDispatch()

	const moveEventIssuedAt = useCallback(
		async (entity: TimelineEntity<'issuedAt'>, markerRealTime: number) => {
			if ((entity.worldEventTrackId ?? 'default') === track.id) {
				dispatch(
					updateEvent({
						id: entity.eventId,
						timestamp: markerRealTime,
					}),
				)
			} else {
				dispatch(
					updateEvent({
						id: entity.eventId,
						worldEventTrackId: track.id,
					}),
				)
			}
			const body: Parameters<typeof updateWorldEvent>[0]['body'] = (() => {
				if ((entity.worldEventTrackId ?? 'default') === track.id) {
					return {
						timestamp: String(Math.round(markerRealTime)),
					}
				}
				return {
					worldEventTrackId: track.baseModel ? track.id : null,
				}
			})()
			const { error } = parseApiResponse(
				await updateWorldEvent({
					body,
					worldId,
					eventId: entity.eventId,
				}),
			)
			if (error) {
				dispatch(updateEvent(entity.baseEntity))
			}
		},
		[dispatch, track.baseModel, track.id, updateEvent, updateWorldEvent, worldId],
	)

	const moveEventRevokedAt = useCallback(
		async (entity: TimelineEntity<'revokedAt'>, markerRealTime: number) => {
			if ((entity.worldEventTrackId ?? 'default') === track.id) {
				dispatch(updateEvent({ id: entity.eventId, revokedAt: markerRealTime }))
			} else {
				dispatch(updateEvent({ id: entity.eventId, worldEventTrackId: track.id }))
			}
			const body: Parameters<typeof updateWorldEvent>[0]['body'] = (() => {
				if ((entity.worldEventTrackId ?? 'default') === track.id) {
					return {
						revokedAt: String(Math.round(markerRealTime)),
					}
				}
				return {
					worldEventTrackId: track.baseModel ? track.id : null,
				}
			})()
			const { error } = parseApiResponse(
				await updateWorldEvent({
					body,
					worldId,
					eventId: entity.eventId,
				}),
			)
			if (error) {
				dispatch(updateEvent(entity.baseEntity))
			}
		},
		[dispatch, track.baseModel, track.id, updateEvent, updateWorldEvent, worldId],
	)

	const moveEventDeltaState = useCallback(
		async (entity: TimelineEntity<'deltaState'>, markerRealTime: number) => {
			if ((entity.worldEventTrackId ?? 'default') === track.id) {
				// Same track - update delta
				dispatch(
					updateEventDelta({
						id: entity.id,
						worldEventId: entity.eventId,
						timestamp: markerRealTime,
					}),
				)
				const { error } = parseApiResponse(
					await updateWorldEventDelta({
						body: {
							timestamp: String(Math.round(markerRealTime)),
						},
						worldId,
						eventId: entity.eventId,
						deltaId: entity.id,
					}),
				)
				if (error) {
					dispatch(updateEvent(events.find((e) => e.id === entity.eventId)!))
					dispatch(updateEventDelta(entity.baseEntity))
				}
			} else {
				// Another track - move event
				dispatch(
					updateEvent({
						id: entity.eventId,
						worldEventTrackId: track.id,
					}),
				)
				const { error } = parseApiResponse(
					await updateWorldEvent({
						body: {
							worldEventTrackId: track.baseModel ? track.id : null,
						},
						worldId,
						eventId: entity.eventId,
					}),
				)
				if (error) {
					dispatch(updateEvent(events.find((e) => e.id === entity.eventId)!))
					dispatch(updateEventDelta(entity.baseEntity))
				}
			}
		},
		[
			dispatch,
			events,
			track.baseModel,
			track.id,
			updateEvent,
			updateEventDelta,
			updateWorldEvent,
			updateWorldEventDelta,
			worldId,
		],
	)

	const { ref, getState } = useDragDropReceiver({
		type: 'timelineEvent',
		receiverRef,
		onDrop: async (state, event) => {
			if (event.mouseEvent?.button !== 0) {
				return
			}
			const entity = state.params.event
			const dx = state.targetPos.x - state.targetRootPos.x
			const absoluteTimestamp = scaledTimeToRealTime(dx - TimelineEventHeightPx / 2) + entity.markerPosition
			const snappedTimestamp = binarySearchForClosest(TimelineState.anchorTimestamps, absoluteTimestamp)
			if (entityIsOfType('issuedAt', entity)) {
				moveEventIssuedAt(entity, snappedTimestamp)
			} else if (entityIsOfType('revokedAt', entity)) {
				moveEventRevokedAt(entity, snappedTimestamp)
			} else if (entityIsOfType('deltaState', entity)) {
				moveEventDeltaState(entity, snappedTimestamp)
			}
		},
	})

	return {
		ref,
		getState,
	}
}

const entityIsOfType = <T extends MarkerType>(
	type: T,
	e: TimelineEntity<MarkerType>,
): e is TimelineEntity<T> => e.markerType === type
