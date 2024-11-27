import { ShapeOfHandler, ShapeOfMessage } from './types'

export enum RedisChannel {
	RHEA_TO_CALLIOPE = 'rheaToCalliope',
}

export enum RheaToCalliopeMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_SHARED = 'worldShared',
	WORLD_UNSHARED = 'worldUnshared',
	WORLD_EVENT_UPDATED = 'worldEventUpdated',
	WORLD_EVENT_DELTA_UPDATED = 'worldEventDeltaUpdated',
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
}

export type RheaToCalliopeMessage = ShapeOfMessage<RheaToCalliopeMessagePayload>
export type RheaToCalliopeMessageHandlers = ShapeOfHandler<RheaToCalliopeMessagePayload>
