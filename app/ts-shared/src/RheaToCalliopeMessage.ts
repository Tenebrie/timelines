export enum RedisChannel {
	RHEA_TO_CALLIOPE = 'rheaToCalliope',
}

export enum RheaToCalliopeMessageType {
	WORLD_UPDATED = 'worldUpdated',
}

export type RheaToCalliopeMessagePayload = {
	[RheaToCalliopeMessageType.WORLD_UPDATED]: {
		userId: string
		worldId: string
		timestamp: string
	}
}

export type RheaToCalliopeMessage = ShapeOfMessage<RheaToCalliopeMessagePayload>
export type RheaToCalliopeMessageHandler = ShapeOfHandler<RheaToCalliopeMessagePayload>

type ShapeOfMessage<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K]) => void
}
