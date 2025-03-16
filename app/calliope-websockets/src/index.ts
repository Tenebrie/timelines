import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as route from 'koa-route'
import * as websocketify from 'koa-websocket'

import { ClientMessageHandlerService } from './services/ClientMessageHandlerService'
import { initRedisConnection } from './services/RedisService'
import { TokenService } from './services/TokenService'
import { WebsocketService } from './services/WebsocketService'
import { ClientToCalliopeMessage } from './ts-shared/ClientToCalliopeMessage'
import { AUTH_COOKIE_NAME } from './ts-shared/const/constants'

const app = websocketify(new Koa())

app.ws.use(
	route.all('/live/:sessionId', function (ctx: websocketify.MiddlewareContext<Koa.DefaultState>) {
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

			ctx.websocket.on('message', (rawMessage) => {
				try {
					const message = JSON.parse(rawMessage.toString()) as ClientToCalliopeMessage
					ClientMessageHandlerService.handleMessage(message, userId, sessionId, ctx.websocket)
				} catch (e) {
					console.error('Error handling message', e)
				}
			})
			ctx.websocket.on('close', () => {
				WebsocketService.unregisterSocket(userId, ctx.websocket)
			})
			ctx.websocket.on('error', () => {
				WebsocketService.unregisterSocket(userId, ctx.websocket)
			})
		} catch (e) {
			console.error('Error establishing websocket session', e)
			throw e
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
