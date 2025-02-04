import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { useWorldTimelineRouter } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { useWorldWikiRouter } from '@/router/routes/featureRoutes/worldWikiRoutes'
import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

import { ActorDetails, WorldEvent } from '../worldTimeline/types'

export type AllowedEvents =
	| 'scrollTimelineLeft'
	| 'scrollTimelineRight'
	| 'sendCalliopeMessage'
	| 'calliopeReconnected'
	| 'timelineScrolled'
	| 'richEditor/openMentions'
	| 'richEditor/updateMentions'
	| 'richEditor/closeMentions'
	| 'richEditor/keyDown'
	| 'navigate/worldTimeline'
	| 'navigate/articleDetails'
	| 'richEditor/forceUpdateEvent'
	| 'richEditor/forceUpdateActor'
	| 'richEditor/forceUpdateArticle'
	| 'richEditor/mentionRender/start'
	| 'richEditor/mentionRender/end'

export type EventParams = {
	['scrollTimelineLeft']: void
	['scrollTimelineRight']: void
	['sendCalliopeMessage']: ClientToCalliopeMessage
	['calliopeReconnected']: void
	['timelineScrolled']: void
	['richEditor/openMentions']: { query: string; screenPosTop: number; screenPosLeft: number }
	['richEditor/updateMentions']: { query: string }
	['richEditor/closeMentions']: void
	['richEditor/keyDown']: {
		key: string
		ctrlKey: boolean
		shiftKey: boolean
		altKey: boolean
		metaKey: boolean
	}
	['navigate/worldTimeline']: Parameters<ReturnType<typeof useWorldTimelineRouter>['navigateTo']>[0]
	['navigate/articleDetails']: Parameters<ReturnType<typeof useWorldWikiRouter>['navigateTo']>[0]
	['richEditor/forceUpdateEvent']: {
		event: WorldEvent
	}
	['richEditor/forceUpdateActor']: {
		actor: ActorDetails
	}
	['richEditor/forceUpdateArticle']: {
		articleId: string
	}
	['richEditor/mentionRender/start']: {
		node: ProseMirrorNode
	}
	['richEditor/mentionRender/end']: {
		node: ProseMirrorNode
	}
}
