import * as WebSocket from 'ws'

import { CalliopeToClientMessage } from '../ts-shared/CalliopeToClientMessage'

const connectedClients: Record<string, RegisteredClient[]> = {}

type RegisteredClient = {
	socket: WebSocket
	sendMessage: (message: CalliopeToClientMessage) => void
}

export const WebsocketService = {
	registerClient: (userId: string, socket: WebSocket) => {
		const newClient: RegisteredClient = {
			socket,
			sendMessage: (message: CalliopeToClientMessage) => {
				socket.send(JSON.stringify(message))
			},
		}

		const sockets = [...(connectedClients[userId] ?? []), newClient]
		connectedClients[userId] = sockets
	},

	findClients: (userId: string) => {
		return connectedClients[userId] || []
	},

	forgetClient: (userId: string, targetSocket: WebSocket) => {
		connectedClients[userId] = (connectedClients[userId] ?? []).filter(
			(client) => client.socket !== targetSocket
		)
	},
}
