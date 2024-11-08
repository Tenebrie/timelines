import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { GetWorldInfoApiResponse, rheaApi } from '../../../api/rheaApi'
import {
	CalliopeToClientMessageHandler,
	CalliopeToClientMessageType,
} from '../../../ts-shared/CalliopeToClientMessage'
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
			dispatch(rheaApi.util.invalidateTags(['announcementList']))
		},
		[CalliopeToClientMessageType.WORLD_UPDATED]: (data) => {
			if (new Date(updatedAtRef.current) < new Date(data.timestamp)) {
				dispatch(rheaApi.util.invalidateTags(['worldDetails']))
			}
		},
		[CalliopeToClientMessageType.WORLD_UNSHARED]: () => {
			dispatch(rheaApi.util.invalidateTags(['worldList']))
		},
		[CalliopeToClientMessageType.WORLD_EVENT_UPDATED]: (data) => {
			dispatch(updateEvent(ingestEvent(JSON.parse(data.event) as GetWorldInfoApiResponse['events'][number])))
		},
	}

	return messageHandlers
}
