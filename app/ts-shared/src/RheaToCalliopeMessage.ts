export enum RedisChannel {
	RHEA_TO_CALLIOPE = 'rheaToCalliope',
}

export enum RheaToCalliopeMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_UNSHARED = 'worldUnshared',
}

export type RheaToCalliopeMessagePayload = {
	[RheaToCalliopeMessageType.ANNOUNCEMENT]: {
		userId: string
	}

	[RheaToCalliopeMessageType.WORLD_UPDATED]: {
		userId: string
		worldId: string
		timestamp: string
	}

	[RheaToCalliopeMessageType.WORLD_UNSHARED]: {
		userId: string
		worldId: string
	}
}

export type RheaToCalliopeMessage = ShapeOfMessage<RheaToCalliopeMessagePayload>
export type RheaToCalliopeMessageHandlers = ShapeOfHandler<RheaToCalliopeMessagePayload>

type ShapeOfMessage<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K]) => void
}
