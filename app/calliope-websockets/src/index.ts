import { setupWSConnection } from '@y/websocket-server/utils'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import route from 'koa-route'
import websocketify from 'koa-websocket'
import { WebSocket } from 'ws'

import { ClientMessageHandlerService } from './services/ClientMessageHandlerService.js'
import { initRedisConnection } from './services/RedisService.js'
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

			const { id: userId } = TokenService.decodeJwtToken(authCookie)
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
			console.error('Error establishing websocket session', e)
			throw e
		}
	}),
)

app.ws.use(
	route.all('/live/yjs/:worldId/:documentId', function (ctx) {
		try {
			const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME)
			if (!authCookie) {
				throw new Error('No cookie provided')
			}

			TokenService.decodeJwtToken(authCookie)

			const worldId = ctx.path.split('/')[3]
			const documentId = ctx.path.split('/')[4]

			if (!worldId || !documentId) {
				throw new Error('Missing worldId or documentId')
			}

			// TODO: Check user has write access to this world
			// const { id: userId } = TokenService.decodeJwtToken(authCookie)
			// await AuthorizationService.checkUserWriteAccessById(userId, worldId)

			const docName = `${worldId}:${documentId}`

			setupWSConnection(ctx.websocket, ctx.req, { docName, gc: true })
			YjsSyncService.setupDocumentListener(docName)

			console.info(`Yjs WebSocket connected for document: ${docName}`)
		} catch (e) {
			console.error('Error establishing Yjs websocket', e)
			ctx.websocket.close(4500, 'Internal server error')
		}
	}),
)

app.use(
	bodyParser({
		enableTypes: ['text', 'json', 'form'],
	}),
)

initRedisConnection()
app.listen(3001)
console.info('Server up')
