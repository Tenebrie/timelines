import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	useUpdateWorldEventDeltaMutation,
	useUpdateWorldEventMutation,
} from '../../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../../utils/parseApiResponse'
import { useDragDropReceiver } from '../../../../../../dragDrop/useDragDropReceiver'
import { useTimelineWorldTime } from '../../../../../../time/hooks/useTimelineWorldTime'
import { worldSlice } from '../../../../../reducer'
import { getTimelineState, getWorldState } from '../../../../../selectors'
import { MarkerType, TimelineEntity } from '../../../../../types'
import { TimelineTrack } from './useEventTracks'

type Props = {
	track: TimelineTrack
}

export const useEventDragDropReceiver = ({ track }: Props) => {
	const { id: worldId } = useSelector(getWorldState)
	const { scaleLevel } = useSelector(getTimelineState)
	const [updateWorldEvent] = useUpdateWorldEventMutation()
	const [updateWorldEventDelta] = useUpdateWorldEventDeltaMutation()
	const { scaledTimeToRealTime } = useTimelineWorldTime({ scaleLevel })

	const { updateEvent, updateEventDelta } = worldSlice.actions
	const dispatch = useDispatch()

	const moveEventIssuedAt = useCallback(
		async (entity: TimelineEntity<'issuedAt'>, markerRealTime: number) => {
			dispatch(
				updateEvent({
					id: entity.eventId,
					timestamp: markerRealTime,
					worldEventTrackId: track.id,
				}),
			)
			const { error } = parseApiResponse(
				await updateWorldEvent({
					body: {
						timestamp: String(markerRealTime),
						worldEventTrackId: track.baseModel ? track.id : null,
					},
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
			dispatch(
				updateEvent({
					id: entity.eventId,
					revokedAt: markerRealTime,
					worldEventTrackId: track.id,
				}),
			)
			const { error } = parseApiResponse(
				await updateWorldEvent({
					body: {
						revokedAt: String(markerRealTime),
						worldEventTrackId: track.baseModel ? track.id : null,
					},
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
						timestamp: String(markerRealTime),
						worldEventTrackId: track.baseModel ? track.id : null,
					},
					worldId,
					eventId: entity.eventId,
					deltaId: entity.id,
				}),
			)
			if (error) {
				dispatch(updateEventDelta(entity.baseEntity))
			}
		},
		[dispatch, track.baseModel, track.id, updateEventDelta, updateWorldEventDelta, worldId],
	)

	const { ref, getState } = useDragDropReceiver({
		type: 'timelineEvent',
		onDrop: async (state) => {
			const entity = state.params.event
			const markerRealTime =
				scaledTimeToRealTime(state.targetPos.x - state.targetRootPos.x - 29) + entity.markerPosition
			if (entityIsOfType('issuedAt', entity)) {
				moveEventIssuedAt(entity, markerRealTime)
			} else if (entityIsOfType('revokedAt', entity)) {
				moveEventRevokedAt(entity, markerRealTime)
			} else if (entityIsOfType('deltaState', entity)) {
				moveEventDeltaState(entity, markerRealTime)
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
