import { CalliopeToClientMessage, CalliopeToClientMessageType } from '@src/ts-shared/CalliopeToClientMessage'
import {
	RheaToCalliopeMessage,
	RheaToCalliopeMessageHandlers,
	RheaToCalliopeMessageType,
} from '@src/ts-shared/RheaToCalliopeMessage'

import { WebsocketService } from './WebsocketService'

const relayMessageToUserSockets = (
	message: CalliopeToClientMessage & { data: CalliopeToClientMessage['data'] & { userId: string } }
) => {
	console.log(message)
	const clients = WebsocketService.findClientsByUserId(message.data.userId)
	console.log(clients.length)
	clients.forEach((client) => client.sendMessage(message))
}

const relayMessageToWorldSockets = (
	message: CalliopeToClientMessage & { data: CalliopeToClientMessage['data'] & { worldId: string } }
) => {
	const clients = WebsocketService.findClientsByWorldId(message.data.worldId)
	clients.forEach((client) => client.sendMessage(message))
}

const handlers: RheaToCalliopeMessageHandlers = {
	[RheaToCalliopeMessageType.ANNOUNCEMENT]: (data) => {
		relayMessageToUserSockets({
			type: CalliopeToClientMessageType.ANNOUNCEMENT,
			data,
		})
	},

	[RheaToCalliopeMessageType.WORLD_SHARED]: (data) => {
		relayMessageToUserSockets({ type: CalliopeToClientMessageType.WORLD_SHARED, data })
	},

	[RheaToCalliopeMessageType.WORLD_UNSHARED]: (data) => {
		relayMessageToUserSockets({ type: CalliopeToClientMessageType.WORLD_UNSHARED, data })
	},

	[RheaToCalliopeMessageType.WORLD_UPDATED]: (data) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_UPDATED, data })
	},

	[RheaToCalliopeMessageType.WORLD_EVENT_UPDATED]: (data) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_EVENT_UPDATED, data })
	},

	[RheaToCalliopeMessageType.WORLD_EVENT_DELTA_UPDATED]: (data) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_EVENT_DELTA_UPDATED, data })
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
