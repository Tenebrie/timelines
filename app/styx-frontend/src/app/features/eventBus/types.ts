import { ActorDetails, MarkerType, TimelineEntity, WorldEvent } from '@api/types/worldTypes'
import type { NavigateOptions } from '@tanstack/react-router'
import { Editor } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

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
	'timeline/onScroll': number
	'timeline/onMarkerHovered': { marker: TimelineEntity<MarkerType>; hover: boolean }
	'timeline/requestScrollTo': ScrollTimelineToParams
	'timeline/requestScrollLeft': void
	'timeline/requestScrollRight': void
	'timeline/requestZoom': { direction: 'in' | 'out' }
	'timeline/eventDrawer/onResize': { height: number }
	'timeline/eventEditor/requestOpen': { extraHeight?: number }
	'timeline/tracksDrawer/onResize': { height: number }
	'mindmap/actorEditor/requestOpen': { extraHeight?: number }
	'world/requestNavigation': NavigateOptions
	'calliope/onReconnected': void
	'calliope/requestSendMessage': ClientToCalliopeMessage
	'richEditor/onKeyDown': {
		editor: Editor
		key: string
		ctrlKey: boolean
		shiftKey: boolean
		altKey: boolean
		metaKey: boolean
	}
	'richEditor/requestOpenMentions': {
		query: string
		screenPosTop: number
		screenPosLeft: number
	}
	'richEditor/requestUpdateMentions': { query: string }
	'richEditor/requestCloseMentions': void
	'richEditor/mentionRender/onStart': { node: ProseMirrorNode }
	'richEditor/mentionRender/onEnd': { node: ProseMirrorNode }
	'richEditor/forceUpdateEvent': { event: WorldEvent }
	'richEditor/forceUpdateActor': { actor: ActorDetails }
	'richEditor/forceUpdateArticle': { articleId: string }
	'richEditor/requestFocus': void
	'richEditor/requestBlur': void
	'summonable/requestSummon': {
		family: string
		element: HTMLElement
		event: { isHandled: boolean }
		props: unknown
	}
	'summonable/requestUpdate': {
		family: string
		element: HTMLElement
		props: unknown
	}
	'summonable/requestDismiss': {
		family: string
		element: HTMLElement
	}
}

// export type EventParams = { [K in keyof typeof eventDefs]: (typeof eventDefs)[K] }
export type AllowedEvents = keyof EventParams
