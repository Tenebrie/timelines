import type { NavigateOptions } from '@tanstack/react-router'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { ActorDetails, MarkerType, TimelineEntity, WorldEvent } from '@/api/types/types'
import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

export type AllowedEvents =
	| 'scrollTimelineTo'
	| 'scrollTimelineLeft'
	| 'scrollTimelineRight'
	| 'timeline/requestZoom'
	| 'timeline/openEventDrawer'
	| 'timeline/closeEventDrawer'
	| 'timeline/markerHovered'
	| 'mindmap/openActorDrawer'
	| 'outliner/tracksDrawerResized'
	| 'outliner/entityDrawerResized'
	| 'sendCalliopeMessage'
	| 'calliopeReconnected'
	| 'timelineScrolled'
	| 'richEditor/openMentions'
	| 'richEditor/updateMentions'
	| 'richEditor/closeMentions'
	| 'richEditor/keyDown'
	| 'navigate/world'
	| 'richEditor/forceUpdateEvent'
	| 'richEditor/forceUpdateActor'
	| 'richEditor/forceUpdateArticle'
	| 'richEditor/mentionRender/start'
	| 'richEditor/mentionRender/end'

type ScrollTimelineToParams =
	| {
			timestamp: number
			skipAnim?: boolean
	  }
	| {
			rawScrollValue: number
			skipAnim?: boolean
	  }

export type EventParams = {
	['scrollTimelineTo']: ScrollTimelineToParams
	['scrollTimelineLeft']: void
	['scrollTimelineRight']: void
	['timeline/requestZoom']: { direction: 'in' | 'out' }
	['timeline/openEventDrawer']: { extraHeight?: number }
	['timeline/closeEventDrawer']: void
	['timeline/markerHovered']: { marker: TimelineEntity<MarkerType>; hover: boolean }
	['mindmap/openActorDrawer']: { extraHeight?: number }
	['outliner/tracksDrawerResized']: { height: number }
	['outliner/entityDrawerResized']: { height: number }
	['sendCalliopeMessage']: ClientToCalliopeMessage
	['calliopeReconnected']: void
	['timelineScrolled']: number
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
	['navigate/world']: NavigateOptions
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
