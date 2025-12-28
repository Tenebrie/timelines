import { WebSocketServer } from 'ws'

const webSocketServer = new WebSocketServer({
	port: 5000,
})

webSocketServer.on('connection', (socket) => {
	socket.on('message', (message) => {
		console.info(message)
	})
})
