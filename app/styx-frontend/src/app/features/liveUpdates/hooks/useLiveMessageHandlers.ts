import { announcementListApi } from '@api/announcementListApi'
import { otherApi } from '@api/otherApi'
import { GetWorldInfoApiResponse, worldDetailsApi } from '@api/worldDetailsApi'
import { worldEventTracksApi } from '@api/worldEventTracksApi'
import { worldListApi } from '@api/worldListApi'
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { WikiArticle } from '@/api/types/worldWikiTypes'
import { useAutoRef } from '@/app/hooks/useAutoRef'
import { ingestActor, ingestEvent, ingestEventDelta } from '@/app/utils/ingestEntity'
import { useArticleApiCache } from '@/app/views/world/views/wiki/api/useArticleApiCache'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import {
	CalliopeToClientMessageHandler,
	CalliopeToClientMessageType,
} from '@/ts-shared/CalliopeToClientMessage'

import { useEventBusDispatch } from '../../eventBus'

export const useLiveMessageHandlers = () => {
	const { updatedAt: currentUpdatedAt } = useSelector(getWorldState, (a, b) => a.updatedAt === b.updatedAt)
	const { updateEvent, updateEventDelta, updateActor } = worldSlice.actions
	const dispatch = useDispatch()

	const { upsertCachedArticle } = useArticleApiCache()

	const forceUpdateActor = useEventBusDispatch({ event: 'richEditor/forceUpdateActor' })
	const forceUpdateEvent = useEventBusDispatch({ event: 'richEditor/forceUpdateEvent' })
	const forceUpdateArticle = useEventBusDispatch({ event: 'richEditor/forceUpdateArticle' })

	const updatedAtRef = useAutoRef(currentUpdatedAt)

	const messageHandlers: CalliopeToClientMessageHandler = {
		[CalliopeToClientMessageType.ANNOUNCEMENT]: () => {
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
			const event = ingestEvent(JSON.parse(data.event) as GetWorldInfoApiResponse['events'][number])
			dispatch(updateEvent(event))
			forceUpdateEvent({ event })
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
		[CalliopeToClientMessageType.ACTOR_UPDATED]: (data) => {
			const actor = ingestActor(JSON.parse(data.actor) as GetWorldInfoApiResponse['actors'][number])
			dispatch(updateActor(actor))
			forceUpdateActor({ actor })
		},
		[CalliopeToClientMessageType.WIKI_ARTICLE_UPDATED]: (data) => {
			const article = JSON.parse(data.article) as WikiArticle
			upsertCachedArticle(article)
			forceUpdateArticle({ articleId: article.id })
		},
		[CalliopeToClientMessageType.WIKI_ARTICLE_DELETED]: () => {
			dispatch(otherApi.util.invalidateTags(['worldWiki']))
		},
	}

	const currentHandlersRef = useRef(messageHandlers)
	currentHandlersRef.current = messageHandlers
	return currentHandlersRef
}
