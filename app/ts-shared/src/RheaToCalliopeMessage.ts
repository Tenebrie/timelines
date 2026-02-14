import { ShapeOfHandlerWithSession, ShapeOfMessageWithSession } from './types.js'

export enum RedisChannel {
	RHEA_TO_CALLIOPE = 'rheaToCalliope',
	CALLIOPE_YJS = 'calliopeYjs',
}

export enum RheaToCalliopeMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_SHARED = 'worldShared',
	WORLD_UNSHARED = 'worldUnshared',
	WORLD_EVENT_UPDATED = 'worldEventUpdated',
	WORLD_EVENT_DELTA_UPDATED = 'worldEventDeltaUpdated',
	WORLD_TRACKS_UPDATED = 'worldTracksUpdated',
	ACTOR_UPDATED = 'actorUpdated',
	CALENDAR_UPDATED = 'calendarUpdated',
	MINDMAP_NODE_UPDATED = 'mindmapNodeUpdated',
	TAG_UPDATED = 'tagUpdated',
	WIKI_ARTICLE_UPDATED = 'wikiArticleUpdated',
	WIKI_ARTICLE_DELETED = 'wikiArticleDeleted',
	DOCUMENT_RESET = 'documentReset',
}

export type RheaToCalliopeMessagePayload = {
	[RheaToCalliopeMessageType.ANNOUNCEMENT]: {
		userId: string
	}
	[RheaToCalliopeMessageType.WORLD_UPDATED]: {
		worldId: string
		timestamp: string
	}
	[RheaToCalliopeMessageType.WORLD_SHARED]: {
		userId: string
	}
	[RheaToCalliopeMessageType.WORLD_UNSHARED]: {
		userId: string
	}
	[RheaToCalliopeMessageType.WORLD_EVENT_UPDATED]: {
		worldId: string
		// TODO: Type properly
		event: string
	}
	[RheaToCalliopeMessageType.WORLD_EVENT_DELTA_UPDATED]: {
		worldId: string
		// TODO: Type properly
		eventDelta: string
	}
	[RheaToCalliopeMessageType.WORLD_TRACKS_UPDATED]: {
		worldId: string
		timestamp: string
	}
	[RheaToCalliopeMessageType.ACTOR_UPDATED]: {
		worldId: string
		// TODO: Type properly
		actor: string
	}
	[RheaToCalliopeMessageType.CALENDAR_UPDATED]: {
		worldId: string
		// TODO: Type properly
		calendar: string
	}
	[RheaToCalliopeMessageType.WIKI_ARTICLE_UPDATED]: {
		worldId: string
		// TODO: Type properly
		article: string
	}
	[RheaToCalliopeMessageType.WIKI_ARTICLE_DELETED]: {
		worldId: string
	}
	[RheaToCalliopeMessageType.MINDMAP_NODE_UPDATED]: {
		worldId: string
		// TODO: Type properly
		node: string
	}
	[RheaToCalliopeMessageType.TAG_UPDATED]: {
		worldId: string
		// TODO: Type properly
		tag: string
	}
	[RheaToCalliopeMessageType.DOCUMENT_RESET]: {
		worldId: string
		entityId: string
	}
}

export type RheaToCalliopeMessage = ShapeOfMessageWithSession<RheaToCalliopeMessagePayload>
export type RheaToCalliopeMessageHandlers = ShapeOfHandlerWithSession<RheaToCalliopeMessagePayload>
