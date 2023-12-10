import { CalliopeToClientMessageType } from '@src/ts-shared/CalliopeToClientMessage'
import {
	RheaToCalliopeMessage,
	RheaToCalliopeMessageHandlers,
	RheaToCalliopeMessageType,
} from '@src/ts-shared/RheaToCalliopeMessage'

import { WebsocketService } from './WebsocketService'

const handlers: RheaToCalliopeMessageHandlers = {
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
}

export const RheaMessageHandlerService = {
	handleMessage: (message: RheaToCalliopeMessage) => {
		const handler = handlers[message.type]
		if (handler) {
			handler(message.data)
		}
	},
}
