import { CalliopeToClientMessageType } from '@src/ts-shared/CalliopeToClientMessage'
import {
	RheaToCalliopeMessage,
	RheaToCalliopeMessageHandlers,
	RheaToCalliopeMessageType,
} from '@src/ts-shared/RheaToCalliopeMessage'

import { WebsocketService } from './WebsocketService'

const handlers: RheaToCalliopeMessageHandlers = {
	[RheaToCalliopeMessageType.ANNOUNCEMENT]: (data) => {
		const clients = WebsocketService.findClients(data.userId)
		clients.forEach((client) =>
			client.sendMessage({
				type: CalliopeToClientMessageType.ANNOUNCEMENT,
				data: null,
			})
		)
	},

	[RheaToCalliopeMessageType.WORLD_UPDATED]: (data) => {
		const clients = WebsocketService.findClients(data.userId)
		clients.forEach((client) =>
			client.sendMessage({
				type: CalliopeToClientMessageType.WORLD_UPDATED,
				data: {
					worldId: data.worldId,
					timestamp: data.timestamp,
				},
			})
		)
	},

	[RheaToCalliopeMessageType.WORLD_UNSHARED]: (data) => {
		const clients = WebsocketService.findClients(data.userId)
		clients.forEach((client) =>
			client.sendMessage({
				type: CalliopeToClientMessageType.WORLD_UNSHARED,
				data: {
					worldId: data.worldId,
				},
			})
		)
	},
}

export const RheaMessageHandlerService = {
	handleMessage: (message: RheaToCalliopeMessage) => {
		const handler = handlers[message.type]
		if (handler) {
			// TODO: The data is guaranteed to be correct, but fix typings
			handler(message.data as any)
		}
	},
}
