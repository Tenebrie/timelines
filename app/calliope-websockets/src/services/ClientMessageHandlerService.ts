import {
	ClientToCalliopeMessage,
	ClientToCalliopeMessageHandlers,
	ClientToCalliopeMessageType,
} from '@src/ts-shared/ClientToCalliopeMessage'
import * as WebSocket from 'ws'

import { WebsocketService } from './WebsocketService'

const handlers: ClientToCalliopeMessageHandlers = {
	[ClientToCalliopeMessageType.INIT]: (_, userId, socket) => {
		WebsocketService.registerUserSocket(userId, socket)
	},
	[ClientToCalliopeMessageType.KEEPALIVE]: () => {
		// Empty
	},
	[ClientToCalliopeMessageType.WORLD_SUBSCRIBE]: (data, userId, socket) => {
		WebsocketService.registerWorldClient(data.worldId, userId, socket)
	},

	[ClientToCalliopeMessageType.WORLD_UNSUBSCRIBE]: (data, userId, socket) => {
		WebsocketService.unregisterWorldClient(data.worldId, userId, socket)
	},
}

export const ClientMessageHandlerService = {
	handleMessage: (message: ClientToCalliopeMessage, userId: string, socket: WebSocket) => {
		const handler = handlers[message.type]
		if (handler) {
			// TODO: The data is guaranteed to be correct, but fix typings)
			handler(message.data as any, userId, socket)
		}
	},
}
