export const WORLD_UPDATE_NAME = 'worldUpdate'

export enum CalliopeToClientMessageType {
	ANNOUNCEMENT = 'announcement',
	WORLD_UPDATED = 'worldUpdated',
	WORLD_UNSHARED = 'worldUnshared',
}

export type CalliopeToClientMessagePayload = {
	[CalliopeToClientMessageType.ANNOUNCEMENT]: null
	[CalliopeToClientMessageType.WORLD_UPDATED]: {
		worldId: string
		timestamp: string
	}
	[CalliopeToClientMessageType.WORLD_UNSHARED]: {
		worldId: string
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
