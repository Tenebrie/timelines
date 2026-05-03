import {
	ClientToCalliopeMessage,
	ClientToCalliopeMessageHandlers,
	ClientToCalliopeMessageType,
} from '@src/ts-shared/ClientToCalliopeMessage.js'
import { WebSocket } from 'ws'

import { WebsocketService } from './WebsocketService.js'

const handlers: ClientToCalliopeMessageHandlers = {
	[ClientToCalliopeMessageType.INIT]: async (_, userId, socket, sessionId) => {
		WebsocketService.registerUserSocket(userId, sessionId, socket)
	},
	[ClientToCalliopeMessageType.KEEPALIVE]: async () => {
		// Empty
	},
	[ClientToCalliopeMessageType.WORLD_SUBSCRIBE]: async (data, userId, socket, sessionId) => {
		return WebsocketService.registerWorldClient(data.worldId, userId, sessionId, socket)
	},

	[ClientToCalliopeMessageType.WORLD_UNSUBSCRIBE]: async (data, userId, socket) => {
		return WebsocketService.unregisterWorldClient(data.worldId, userId, socket)
	},
}

export const ClientMessageHandlerService = {
	handleMessage: async (
		message: ClientToCalliopeMessage,
		userId: string,
		sessionId: string | undefined,
		socket: WebSocket,
	) => {
		if (!sessionId) {
			throw new Error('No session id')
		}

		const handler = handlers[message.type]
		if (handler) {
			// TODO: The data is guaranteed to be correct, but fix typings)
			await handler(message.data as never, userId, socket, sessionId)
		}
	},
}
