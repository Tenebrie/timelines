import { setupWSConnection } from '@y/websocket-server/utils'
import chalk from 'chalk'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import route from 'koa-route'
import websocketify from 'koa-websocket'
import { WebSocket } from 'ws'

import { ClientMessageHandlerService } from './services/ClientMessageHandlerService.js'
import { persistenceLeaderService } from './services/PersistenceLeaderService.js'
import { initRedisConnection } from './services/RedisService.js'
import { RheaService } from './services/RheaService.js'
import { TokenService } from './services/TokenService.js'
import { WebsocketService } from './services/WebsocketService.js'
import { YjsSyncService } from './services/YjsSyncService.js'
import { ClientToCalliopeMessage } from './ts-shared/ClientToCalliopeMessage.js'
import { AUTH_COOKIE_NAME } from './ts-shared/const/constants.js'

const app = websocketify(new Koa())

app.ws.use(
	route.all('/live/:sessionId', function (ctx) {
		try {
			const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME)
			if (!authCookie) {
				throw new Error('No cookie provided')
			}

			const { id: userId } = TokenService.decodeUserToken(authCookie)
			const sessionId = ctx.path.split('/')[2]
			if (!sessionId) {
				throw new Error('No session id')
			}

			const socket = ctx.websocket as WebSocket
			socket.on('message', (rawMessage) => {
				try {
					const message = JSON.parse(rawMessage.toString()) as ClientToCalliopeMessage
					ClientMessageHandlerService.handleMessage(message, userId, sessionId, ctx.websocket)
				} catch (e) {
					console.error('Error handling message', e)
				}
			})
			socket.on('close', () => {
				WebsocketService.unregisterSocket(userId, ctx.websocket)
			})
			socket.on('error', () => {
				WebsocketService.unregisterSocket(userId, ctx.websocket)
			})
		} catch (e) {
			console.error('Error establishing websocket session:', e)
			ctx.websocket.close(4500, 'Error establishing socket')
		}
	}),
)

app.ws.use(
	route.all('/live/yjs/:worldId/:entityType/:documentId', async function (ctx) {
		const messageQueue: { data: Buffer | ArrayBuffer | Buffer[]; isBinary: boolean }[] = []
		let isSetupComplete = false

		const originalOnMessage = ctx.websocket.onmessage
		ctx.websocket.onmessage = (event) => {
			if (!isSetupComplete) {
				messageQueue.push({
					data: event.data as Buffer | ArrayBuffer | Buffer[],
					isBinary: typeof event.data !== 'string',
				})
			} else if (originalOnMessage) {
				originalOnMessage.call(ctx.websocket, event)
			}
		}

		try {
			const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME)
			if (!authCookie) {
				throw new Error('No cookie provided')
			}

			const worldId = ctx.path.split('/')[3]
			const entityType = ctx.path.split('/')[4]
			const documentId = ctx.path.split('/')[5]

			if (!worldId || !entityType || !documentId) {
				throw new Error('Missing worldId, entityType, or documentId')
			}

			if (!['actor', 'event', 'article'].includes(entityType)) {
				throw new Error('Invalid entityType')
			}

			const docName = `${worldId}:${documentId}`
			const { id: userId } = TokenService.decodeUserToken(authCookie)
			await RheaService.checkUserAccess({ worldId, userId, level: 'write' })
			setupWSConnection(ctx.websocket, ctx.req, { docName, gc: true })

			await YjsSyncService.setupDocumentListener({
				userId,
				worldId,
				entityId: documentId,
				entityType: entityType as 'actor' | 'event' | 'article',
				docName,
			})

			// Replay queued messages
			isSetupComplete = true
			for (const queuedMessage of messageQueue) {
				ctx.websocket.emit('message', queuedMessage.data, queuedMessage.isBinary)
			}
			messageQueue.length = 0
		} catch (e) {
			console.error('Error establishing Yjs websocket:', e)
			ctx.websocket.close(4500, 'Error establishing socket')
		}
	}),
)

app.ws.use(
	route.all('(.*)', async function (ctx) {
		console.warn(`Rejected WebSocket connection to invalid path: ${ctx.path}`)
		ctx.websocket.close(4404, `Invalid path: ${ctx.path}`)
	}),
)

app.use(
	bodyParser({
		enableTypes: ['text', 'json', 'form'],
	}),
)

initRedisConnection()
YjsSyncService.setupGlobalHooks()
persistenceLeaderService.connect()

const server = app.listen(3001)
console.info(`${chalk.greenBright('[Calliope]')} Listening on port ${chalk.blueBright('3001')}`)

const shutdown = async () => {
	console.info('Shutting down gracefully...')
	await persistenceLeaderService.shutdown()
	server.close()
	process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
