import { announcementListApi } from '@api/announcementListApi'
import { GetWorldInfoApiResponse, worldDetailsApi } from '@api/worldDetailsApi'
import { worldEventTracksApi } from '@api/worldEventTracksApi'
import { worldListApi } from '@api/worldListApi'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	CalliopeToClientMessageHandler,
	CalliopeToClientMessageType,
} from '@/ts-shared/CalliopeToClientMessage'

import { ingestEvent, ingestEventDelta } from '../../utils/ingestEvent'
import { worldSlice } from '../worldTimeline/reducer'
import { getWorldState } from '../worldTimeline/selectors'

export const useLiveMessageHandlers = () => {
	const updatedAtRef = useRef<string>('0')

	const { updatedAt: currentUpdatedAt } = useSelector(getWorldState, (a, b) => a.updatedAt === b.updatedAt)
	const { updateEvent, updateEventDelta } = worldSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		updatedAtRef.current = currentUpdatedAt
	}, [currentUpdatedAt])

	const messageHandlers: CalliopeToClientMessageHandler = {
		[CalliopeToClientMessageType.ANNOUNCEMENT]: () => {
			// TODO: Invalidate on all APIs
			dispatch(announcementListApi.util.invalidateTags(['announcementList']))
		},
		[CalliopeToClientMessageType.WORLD_UPDATED]: (data) => {
			if (new Date(updatedAtRef.current) < new Date(data.timestamp)) {
				dispatch(worldDetailsApi.util.invalidateTags(['worldDetails']))
			}
		},
		[CalliopeToClientMessageType.WORLD_TRACKS_UPDATED]: () => {
			dispatch(worldEventTracksApi.util.invalidateTags(['worldEventTracks']))
		},
		[CalliopeToClientMessageType.WORLD_SHARED]: () => {
			dispatch(worldListApi.util.invalidateTags(['worldList']))
		},
		[CalliopeToClientMessageType.WORLD_UNSHARED]: () => {
			dispatch(worldListApi.util.invalidateTags(['worldList']))
		},
		[CalliopeToClientMessageType.WORLD_EVENT_UPDATED]: (data) => {
			dispatch(updateEvent(ingestEvent(JSON.parse(data.event) as GetWorldInfoApiResponse['events'][number])))
		},
		[CalliopeToClientMessageType.WORLD_EVENT_DELTA_UPDATED]: (data) => {
			dispatch(
				updateEventDelta(
					ingestEventDelta(
						JSON.parse(data.eventDelta) as GetWorldInfoApiResponse['events'][number]['deltaStates'][number],
					),
				),
			)
		},
	}

	return messageHandlers
}
