import { RefObject, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { useUpdateWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { useDragDropReceiver } from '@/app/features/dragDrop/useDragDropReceiver'
import { useTimelineLevelScalar } from '@/app/features/time/hooks/useTimelineLevelScalar'
import { useTimelineWorldTime } from '@/app/features/time/hooks/useTimelineWorldTime'
import { worldSlice } from '@/app/features/world/reducer'
import { getTimelineState, getWorldState } from '@/app/features/world/selectors'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { LineSpacing } from '@/app/features/worldTimeline/utils/constants'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { TimelineTrack } from './useEventTracks'

type Props = {
	track: TimelineTrack
	receiverRef?: RefObject<HTMLDivElement | null>
}

export const useEventDragDropReceiver = ({ track, receiverRef }: Props) => {
	const { id: worldId, events, calendar } = useSelector(getWorldState)
	const { scaleLevel } = useSelector(getTimelineState)
	const [updateWorldEvent] = useUpdateWorldEventMutation()
	const [updateWorldEventDelta] = useUpdateWorldEventDeltaMutation()
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel, calendar })

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

	const { getLevelScalar } = useTimelineLevelScalar()
	const { ref, getState } = useDragDropReceiver({
		type: 'timelineEvent',
		receiverRef,
		onDrop: async (state) => {
			const entity = state.params.event
			const roundingFactor = LineSpacing * getLevelScalar(scaleLevel)
			const realTime =
				scaledTimeToRealTime(state.targetPos.x - state.targetRootPos.x - 10) + entity.markerPosition
			const roundedRealTime = Math.round(realTime / roundingFactor) * roundingFactor
			if (entityIsOfType('issuedAt', entity)) {
				moveEventIssuedAt(entity, roundedRealTime)
			} else if (entityIsOfType('revokedAt', entity)) {
				moveEventRevokedAt(entity, roundedRealTime)
			} else if (entityIsOfType('deltaState', entity)) {
				moveEventDeltaState(entity, roundedRealTime)
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
