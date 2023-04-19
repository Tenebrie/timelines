export const enum WebsocketToCalliopeChannel {
	INIT = 'init',
	KEEPALIVE = 'keepalive',
}

export type WebsocketToCalliopeMessageData = {
	[WebsocketToCalliopeChannel.INIT]: null
	[WebsocketToCalliopeChannel.KEEPALIVE]: null
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

export type WebsocketToCalliopeMessage = MapToMessage<WebsocketToCalliopeMessageData>
export type WebsocketToCalliopeMessageReceiver = MapToMessageReceiver<WebsocketToCalliopeMessageData>
