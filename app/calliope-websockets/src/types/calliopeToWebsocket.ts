export const enum CalliopeToWebsocketChannel {
	WORLD_UPDATED = 'worldUpdate',
}

export type CalliopeToWebsocketMessageData = {
	[CalliopeToWebsocketChannel.WORLD_UPDATED]: {
		worldId: string
		timestamp: string
	}
}

type MapToMessageReceiver<T> = {
	[K in keyof T]: (data: T[K]) => void
}

type MapToMessage<T> = {
	[K in keyof T]: {
		channel: K
		data: T[K]
	}
}[keyof T]

export type CalliopeToWebsocketMessage = MapToMessage<CalliopeToWebsocketMessageData>
export type CalliopeToWebsocketMessageReceiver = MapToMessageReceiver<CalliopeToWebsocketMessageData>
