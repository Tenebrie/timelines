import * as WebSocket from 'ws'

import { CalliopeToClientMessage } from '../ts-shared/CalliopeToClientMessage'

// userId -> RegisteredClient
const userListeners: Record<string, RegisteredClient[]> = {}
// userId/worldId -> RegisteredClient
const worldListeners: Record<string, RegisteredClient[]> = {}

type RegisteredClient = {
	socket: WebSocket
	userId: string
	sessionId: string
	sendMessage: (message: CalliopeToClientMessage) => void
}

export const WebsocketService = {
	registerUserSocket: (userId: string, sessionId: string, socket: WebSocket) => {
		const newClient: RegisteredClient = {
			socket,
			userId,
			sessionId,
			sendMessage: (message: CalliopeToClientMessage) => {
				socket.send(JSON.stringify(message))
			},
		}

		const sockets = [...(userListeners[userId] ?? []), newClient]
		userListeners[userId] = sockets
		return newClient
	},

	unregisterSocket: (userId: string, targetSocket: WebSocket) => {
		userListeners[userId] = (userListeners[userId] ?? []).filter((client) => client.socket !== targetSocket)
		Object.entries(worldListeners)
			.filter(([key]) => key.startsWith(`${userId}`))
			.forEach(([key, clients]) => {
				worldListeners[key] = clients.filter((client) => client.socket !== targetSocket)
			})
	},

	registerWorldClient: (worldId: string, userId: string, sessionId: string, socket: WebSocket) => {
		const newClient: RegisteredClient = {
			socket,
			userId,
			sessionId,
			sendMessage: (message: CalliopeToClientMessage) => {
				socket.send(JSON.stringify(message))
			},
		}

		const key = `${userId}/${worldId}`

		const sockets = [...(worldListeners[key] ?? []), newClient]
		worldListeners[key] = sockets
	},

	unregisterWorldClient: (worldId: string, userId: string, targetSocket: WebSocket) => {
		const key = `${userId}/${worldId}`
		worldListeners[key] = (worldListeners[key] ?? []).filter((client) => client.socket !== targetSocket)
	},

	findClientsByUserId: (userId: string) => {
		return userListeners[userId] || []
	},

	findClientsByWorldId: (worldId: string) => {
		return Object.entries(worldListeners)
			.filter(([key]) => key.endsWith(`${worldId}`))
			.flatMap(([, clients]) => clients)
	},
}
