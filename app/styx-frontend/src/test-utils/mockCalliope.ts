import { Server } from 'ws'

const webSocketServer = new Server({
	port: 5000,
})

webSocketServer.on('connection', (socket) => {
	socket.on('message', (message) => {
		console.info(message)
	})
})
