export const WORLD_UPDATE_NAME = 'worldUpdate'

export enum CalliopeToClientMessageType {
	WORLD_UPDATED = 'worldUpdated',
}

export type CalliopeToClientMessagePayload = {
	[CalliopeToClientMessageType.WORLD_UPDATED]: {
		worldId: string
		timestamp: string
	}
}

export type CalliopeToClientMessage = ShapeOfMessage<CalliopeToClientMessagePayload>
export type CalliopeToClientMessageHandler = ShapeOfHandler<CalliopeToClientMessagePayload>

type ShapeOfMessage<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K]) => void
}
