import type { NavigateOptions } from '@tanstack/react-router'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { ActorDetails, MarkerType, TimelineEntity, WorldEvent } from '@/api/types/types'
import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

export type AllowedEvents =
	| 'timeline/onScroll'
	| 'timeline/onMarkerHovered'
	| 'timeline/requestScrollTo'
	| 'timeline/requestScrollLeft'
	| 'timeline/requestScrollRight'
	| 'timeline/requestZoom'
	| 'timeline/eventDrawer/onResize'
	| 'timeline/eventDrawer/requestOpen'
	| 'timeline/eventDrawer/requestClose'
	| 'timeline/tracksDrawer/onResize'
	| 'mindmap/actorDrawer/requestOpen'
	| 'world/requestNavigation'
	| 'calliope/onReconnected'
	| 'calliope/requestSendMessage'
	| 'richEditor/onKeyDown'
	| 'richEditor/requestOpenMentions'
	| 'richEditor/requestUpdateMentions'
	| 'richEditor/requestCloseMentions'
	| 'richEditor/mentionRender/onStart'
	| 'richEditor/mentionRender/onEnd'
	| 'richEditor/forceUpdateEvent'
	| 'richEditor/forceUpdateActor'
	| 'richEditor/forceUpdateArticle'

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
	['timeline/requestScrollTo']: ScrollTimelineToParams
	['timeline/requestScrollLeft']: void
	['timeline/requestScrollRight']: void
	['timeline/requestZoom']: { direction: 'in' | 'out' }
	['timeline/eventDrawer/requestOpen']: { extraHeight?: number }
	['timeline/eventDrawer/requestClose']: void
	['timeline/onMarkerHovered']: { marker: TimelineEntity<MarkerType>; hover: boolean }
	['mindmap/actorDrawer/requestOpen']: { extraHeight?: number }
	['timeline/tracksDrawer/onResize']: { height: number }
	['timeline/eventDrawer/onResize']: { height: number }
	['calliope/requestSendMessage']: ClientToCalliopeMessage
	['calliope/onReconnected']: void
	['timeline/onScroll']: number
	['richEditor/requestOpenMentions']: { query: string; screenPosTop: number; screenPosLeft: number }
	['richEditor/requestUpdateMentions']: { query: string }
	['richEditor/requestCloseMentions']: void
	['richEditor/onKeyDown']: {
		key: string
		ctrlKey: boolean
		shiftKey: boolean
		altKey: boolean
		metaKey: boolean
	}
	['world/requestNavigation']: NavigateOptions
	['richEditor/forceUpdateEvent']: {
		event: WorldEvent
	}
	['richEditor/forceUpdateActor']: {
		actor: ActorDetails
	}
	['richEditor/forceUpdateArticle']: {
		articleId: string
	}
	['richEditor/mentionRender/onStart']: {
		node: ProseMirrorNode
	}
	['richEditor/mentionRender/onEnd']: {
		node: ProseMirrorNode
	}
}
