import * as WebSocket from 'ws'

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
}
