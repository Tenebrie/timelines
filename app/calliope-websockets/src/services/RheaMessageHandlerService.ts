import {
	CalliopeToClientMessage,
	CalliopeToClientMessageType,
} from '@src/ts-shared/CalliopeToClientMessage.js'
import {
	RheaToCalliopeMessage,
	RheaToCalliopeMessageHandlers,
	RheaToCalliopeMessageType,
} from '@src/ts-shared/RheaToCalliopeMessage.js'

import { WebsocketService } from './WebsocketService.js'

/**
 * Relays a message to all sockets of a user
 * The `userId` param is provided by Rhea, indicating the user to relay the message to.
 * The `messageSourceSessionId` param indicates the source session of the request (websocket connection), which should be ignored.
 */
const relayMessageToUserSockets = (
	message: CalliopeToClientMessage & {
		data: CalliopeToClientMessage['data'] & { userId: string }
		messageSourceSessionId: string | undefined
	},
) => {
	const clients = WebsocketService.findClientsByUserId(message.data.userId)
	const sessionIdToIgnore = message.messageSourceSessionId
	clients
		.filter((client) => !sessionIdToIgnore || client.sessionId !== sessionIdToIgnore)
		.forEach((client) => client.sendMessage(message))
}

const relayMessageToWorldSockets = (
	message: CalliopeToClientMessage & {
		data: CalliopeToClientMessage['data'] & { worldId: string }
		messageSourceSessionId: string | undefined
	},
) => {
	const clients = WebsocketService.findClientsByWorldId(message.data.worldId)
	const sessionIdToIgnore = message.messageSourceSessionId
	clients
		.filter((client) => !sessionIdToIgnore || client.sessionId !== sessionIdToIgnore)
		.forEach((client) => client.sendMessage(message))
}

const handlers: RheaToCalliopeMessageHandlers = {
	[RheaToCalliopeMessageType.ANNOUNCEMENT]: (ctx) => {
		relayMessageToUserSockets({
			type: CalliopeToClientMessageType.ANNOUNCEMENT,
			...ctx,
		})
	},

	[RheaToCalliopeMessageType.WORLD_SHARED]: (ctx) => {
		relayMessageToUserSockets({ type: CalliopeToClientMessageType.WORLD_SHARED, ...ctx })
	},

	[RheaToCalliopeMessageType.WORLD_UNSHARED]: (ctx) => {
		relayMessageToUserSockets({ type: CalliopeToClientMessageType.WORLD_UNSHARED, ...ctx })
	},

	[RheaToCalliopeMessageType.WORLD_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.WORLD_EVENT_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_EVENT_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.WORLD_EVENT_DELTA_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_EVENT_DELTA_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.WORLD_TRACKS_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WORLD_TRACKS_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.ACTOR_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.ACTOR_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.CALENDAR_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.CALENDAR_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.MINDMAP_NODE_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.MINDMAP_NODE_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.WIKI_ARTICLE_UPDATED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WIKI_ARTICLE_UPDATED, ...ctx })
	},

	[RheaToCalliopeMessageType.WIKI_ARTICLE_DELETED]: (ctx) => {
		relayMessageToWorldSockets({ type: CalliopeToClientMessageType.WIKI_ARTICLE_DELETED, ...ctx })
	},
}

export const RheaMessageHandlerService = {
	handleMessage: (message: RheaToCalliopeMessage) => {
		const handler = handlers[message.type]
		if (handler) {
			// TODO: The data is guaranteed to be correct, but fix typings
			handler({ data: message.data as never, messageSourceSessionId: message.messageSourceSessionId })
		}
	},
}
