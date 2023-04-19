import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as route from 'koa-route'
import * as websocketify from 'koa-websocket'
import { WebsocketToCalliopeChannel, WebsocketToCalliopeMessage } from 'src/types/websocketToCalliope'

import { initRedisConnection } from './services/RedisService'
import { TokenService } from './services/TokenService'
import { WebsocketService } from './services/WebsocketService'

const app = websocketify(new Koa())

const AUTH_COOKIE_NAME = 'user-jwt-token'

app.ws.use(
	route.all('/live', function (ctx: websocketify.MiddlewareContext<Koa.DefaultState>) {
		const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME)
		if (!authCookie) {
			throw new Error('No cookie provided')
		}

		const { id: userId } = TokenService.decodeJwtToken(authCookie)

		ctx.websocket.on('open', () => {
			console.log('Client connected!')
		})
		ctx.websocket.on('message', (rawMessage) => {
			try {
				const message = JSON.parse(rawMessage.toString()) as WebsocketToCalliopeMessage
				if (message.channel === WebsocketToCalliopeChannel.INIT) {
					WebsocketService.registerClient(userId, ctx.websocket)
				}
			} catch (err) {
				console.error('Invalid message from client', err)
			}
		})
		ctx.websocket.on('close', () => {
			WebsocketService.forgetClient(userId, ctx.websocket)
		})
		ctx.websocket.on('error', () => {
			WebsocketService.forgetClient(userId, ctx.websocket)
		})
	})
)

app.use(
	bodyParser({
		enableTypes: ['text', 'json', 'form'],
	})
)

initRedisConnection()
app.listen(3001)
console.info('[CALLIOPE] Server up')
