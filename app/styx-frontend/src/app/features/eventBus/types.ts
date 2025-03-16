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
	| 'timeline/eventEditor/requestOpen'
	| 'timeline/tracksDrawer/onResize'
	| 'mindmap/actorEditor/requestOpen'
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
	| 'richEditor/requestFocus'
	| 'richEditor/requestBlur'

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
	['timeline/onScroll']: number
	['timeline/onMarkerHovered']: { marker: TimelineEntity<MarkerType>; hover: boolean }
	['timeline/requestScrollTo']: ScrollTimelineToParams
	['timeline/requestScrollLeft']: void
	['timeline/requestScrollRight']: void
	['timeline/requestZoom']: { direction: 'in' | 'out' }
	['timeline/eventDrawer/onResize']: { height: number }
	['timeline/eventEditor/requestOpen']: { extraHeight?: number }
	['timeline/tracksDrawer/onResize']: { height: number }
	['mindmap/actorEditor/requestOpen']: { extraHeight?: number }
	['world/requestNavigation']: NavigateOptions
	['calliope/onReconnected']: void
	['calliope/requestSendMessage']: ClientToCalliopeMessage
	['richEditor/onKeyDown']: {
		key: string
		ctrlKey: boolean
		shiftKey: boolean
		altKey: boolean
		metaKey: boolean
	}
	['richEditor/requestOpenMentions']: { query: string; screenPosTop: number; screenPosLeft: number }
	['richEditor/requestUpdateMentions']: { query: string }
	['richEditor/requestCloseMentions']: void
	['richEditor/mentionRender/onStart']: {
		node: ProseMirrorNode
	}
	['richEditor/mentionRender/onEnd']: {
		node: ProseMirrorNode
	}
	['richEditor/forceUpdateEvent']: {
		event: WorldEvent
	}
	['richEditor/forceUpdateActor']: {
		actor: ActorDetails
	}
	['richEditor/forceUpdateArticle']: {
		articleId: string
	}
	['richEditor/requestFocus']: void
	['richEditor/requestBlur']: void
}
