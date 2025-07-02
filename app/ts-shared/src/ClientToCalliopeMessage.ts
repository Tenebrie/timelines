import { WebSocket } from 'ws'

import { EmptyObject, ShapeOfMessage } from './types.js'

export const WORLD_UPDATE_NAME = 'worldUpdate'

export enum ClientToCalliopeMessageType {
	INIT = 'init',
	KEEPALIVE = 'keepalive',
	WORLD_SUBSCRIBE = 'worldSubscribe',
	WORLD_UNSUBSCRIBE = 'worldUnsubscribe',
}

export type ClientToCalliopeMessagePayload = {
	[ClientToCalliopeMessageType.INIT]: EmptyObject
	[ClientToCalliopeMessageType.KEEPALIVE]: EmptyObject
	[ClientToCalliopeMessageType.WORLD_SUBSCRIBE]: {
		worldId: string
	}
	[ClientToCalliopeMessageType.WORLD_UNSUBSCRIBE]: {
		worldId: string
	}
}

export type ClientToCalliopeMessage = ShapeOfMessage<ClientToCalliopeMessagePayload>
export type ClientToCalliopeMessageHandlers = ShapeOfHandler<ClientToCalliopeMessagePayload>

export type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K], userId: string, socket: WebSocket, sessionId: string) => void
}
