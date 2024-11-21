import { announcementListApi } from '@api/announcementListApi'
import { GetWorldInfoApiResponse, worldDetailsApi } from '@api/worldDetailsApi'
import { worldListApi } from '@api/worldListApi'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	CalliopeToClientMessageHandler,
	CalliopeToClientMessageType,
} from '@/ts-shared/CalliopeToClientMessage'

import { ingestEvent } from '../../utils/ingestEvent'
import { worldSlice } from '../world/reducer'
import { getWorldState } from '../world/selectors'

export const useLiveMessageHandlers = () => {
	const updatedAtRef = useRef<string>('0')

	const { updatedAt: currentUpdatedAt } = useSelector(getWorldState)
	const { updateEvent } = worldSlice.actions
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
				// TODO: Invalidate on all APIs
				dispatch(worldDetailsApi.util.invalidateTags(['worldDetails']))
			}
		},
		[CalliopeToClientMessageType.WORLD_UNSHARED]: () => {
			// TODO: Invalidate on all APIs
			dispatch(worldListApi.util.invalidateTags(['worldList']))
		},
		[CalliopeToClientMessageType.WORLD_EVENT_UPDATED]: (data) => {
			dispatch(updateEvent(ingestEvent(JSON.parse(data.event) as GetWorldInfoApiResponse['events'][number])))
		},
	}

	return messageHandlers
}
