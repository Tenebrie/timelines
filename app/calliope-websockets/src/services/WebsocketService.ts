import * as WebSocket from 'ws'

import { CalliopeToWebsocketMessage } from '../types/calliopeToWebsocket'

const connectedClients: Record<string, WebSocket[]> = {}

export const WebsocketService = {
	registerClient: (userId: string, socket: WebSocket) => {
		const sockets = [...(connectedClients[userId] ?? []), socket]
		connectedClients[userId] = sockets
	},

	findClients: (userId: string) => {
		return connectedClients[userId] || []
	},

	forgetClient: (userId: string, targetSocket: WebSocket) => {
		connectedClients[userId] = (connectedClients[userId] ?? []).filter((socket) => socket !== targetSocket)
	},

	sendMessage: (userId: string, message: CalliopeToWebsocketMessage) => {
		const clients = WebsocketService.findClients(userId)
		clients.forEach((client) => client.send(JSON.stringify(message)))
	},
}
