import { EmptyObject, ShapeOfHandler, ShapeOfMessage } from './types.js'

export const WORLD_UPDATE_NAME = 'worldUpdate'

export enum CalliopeToClientMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_SHARED = 'worldShared',
	WORLD_UNSHARED = 'worldUnshared',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_EVENT_UPDATED = 'worldEventUpdated',
	WORLD_EVENT_DELTA_UPDATED = 'worldEventDeltaUpdated',
	WORLD_TRACKS_UPDATED = 'worldTracksUpdated',
	ACTOR_UPDATED = 'actorUpdated',
	MINDMAP_NODE_UPDATED = 'mindmapNodeUpdated',
	WIKI_ARTICLE_UPDATED = 'wikiArticleUpdated',
	WIKI_ARTICLE_DELETED = 'wikiArticleDeleted',
}

export type CalliopeToClientMessagePayload = {
	[CalliopeToClientMessageType.ANNOUNCEMENT]: EmptyObject
	[CalliopeToClientMessageType.WORLD_SHARED]: EmptyObject
	[CalliopeToClientMessageType.WORLD_UNSHARED]: EmptyObject

	[CalliopeToClientMessageType.WORLD_UPDATED]: {
		worldId: string
		timestamp: string
	}
	[CalliopeToClientMessageType.WORLD_EVENT_UPDATED]: {
		worldId: string
		// TODO: Type properly
		event: string
	}
	[CalliopeToClientMessageType.WORLD_EVENT_DELTA_UPDATED]: {
		worldId: string
		// TODO: Type properly
		eventDelta: string
	}
	[CalliopeToClientMessageType.WORLD_TRACKS_UPDATED]: {
		worldId: string
		timestamp: string
	}
	[CalliopeToClientMessageType.ACTOR_UPDATED]: {
		worldId: string
		// TODO: Type properly
		actor: string
	}
	[CalliopeToClientMessageType.WIKI_ARTICLE_UPDATED]: {
		worldId: string
		// TODO: Type properly
		article: string
	}
	[CalliopeToClientMessageType.WIKI_ARTICLE_DELETED]: {
		worldId: string
	}
	[CalliopeToClientMessageType.MINDMAP_NODE_UPDATED]: {
		worldId: string
		// TODO: Type properly
		node: string
	}
}

export type CalliopeToClientMessage = ShapeOfMessage<CalliopeToClientMessagePayload>
export type CalliopeToClientMessageHandler = ShapeOfHandler<CalliopeToClientMessagePayload>
