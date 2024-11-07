import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	useUpdateWorldEventDeltaMutation,
	useUpdateWorldEventMutation,
} from '../../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../../utils/parseApiResponse'
import { useDragDropReceiver } from '../../../../../../dragDrop/useDragDropReceiver'
import { getTimelinePreferences } from '../../../../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../../../../time/hooks/useTimelineLevelScalar'
import { useTimelineWorldTime } from '../../../../../../time/hooks/useTimelineWorldTime'
import { worldSlice } from '../../../../../reducer'
import { getTimelineState, getWorldState } from '../../../../../selectors'
import { MarkerType, TimelineEntity } from '../../../../../types'
import { TimelineTrack } from './useEventTracks'

type Props = {
	track: TimelineTrack
	receiverRef?: React.MutableRefObject<HTMLDivElement | null>
}

export const useEventDragDropReceiver = ({ track, receiverRef }: Props) => {
	const { id: worldId, events } = useSelector(getWorldState)
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
						timestamp: String(Math.round(markerRealTime)),
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
						revokedAt: String(Math.round(markerRealTime)),
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
				updateEvent({
					id: entity.eventId,
					worldEventTrackId: track.id,
				}),
			)
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
						worldEventTrackId: track.baseModel ? track.id : null,
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
		},
		[
			dispatch,
			events,
			track.baseModel,
			track.id,
			updateEvent,
			updateEventDelta,
			updateWorldEventDelta,
			worldId,
		],
	)

	const { getLevelScalar } = useTimelineLevelScalar()
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { ref, getState } = useDragDropReceiver({
		type: 'timelineEvent',
		receiverRef,
		onDrop: async (state) => {
			const entity = state.params.event
			const roundingFactor = lineSpacing * getLevelScalar(scaleLevel)
			const realTime =
				scaledTimeToRealTime(state.targetPos.x - state.targetRootPos.x - 29) + entity.markerPosition
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
