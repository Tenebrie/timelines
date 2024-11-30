import { EmptyObject, ShapeOfHandler, ShapeOfMessage } from './types'

export const WORLD_UPDATE_NAME = 'worldUpdate'

export enum CalliopeToClientMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_SHARED = 'worldShared',
	WORLD_UNSHARED = 'worldUnshared',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_EVENT_UPDATED = 'worldEventUpdated',
	WORLD_EVENT_DELTA_UPDATED = 'worldEventDeltaUpdated',
	WORLD_TRACKS_UPDATED = 'worldTracksUpdated',
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
}

export type CalliopeToClientMessage = ShapeOfMessage<CalliopeToClientMessagePayload>
export type CalliopeToClientMessageHandler = ShapeOfHandler<CalliopeToClientMessagePayload>
