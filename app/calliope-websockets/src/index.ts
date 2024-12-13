import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as route from 'koa-route'
import * as websocketify from 'koa-websocket'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'tenebrie-framework'

import { ClientMessageHandlerService } from './services/ClientMessageHandlerService'
import { initRedisConnection } from './services/RedisService'
import { TokenService } from './services/TokenService'
import { WebsocketService } from './services/WebsocketService'
import { ClientToCalliopeMessage } from './ts-shared/ClientToCalliopeMessage'

const app = websocketify(new Koa())

useApiHeader({
	title: 'Timelines Calliope',
	description: 'This is a description field',
	termsOfService: 'https://example.com',
	contact: {
		name: 'Tenebrie',
		url: 'https://github.com/tenebrie',
		email: 'tianara@tenebrie.com',
	},
	license: {
		name: 'MIT',
		url: 'https://example.com',
	},
	version: '1.0.0',
})

const AUTH_COOKIE_NAME = 'user-jwt-token'

app.ws.use(
	route.all('/live', function (ctx: websocketify.MiddlewareContext<Koa.DefaultState>) {
		const authCookie = ctx.cookies.get(AUTH_COOKIE_NAME)
		if (!authCookie) {
			throw new Error('No cookie provided')
		}

		const { id: userId } = TokenService.decodeJwtToken(authCookie)

		ctx.websocket.on('message', (rawMessage) => {
			try {
				const message = JSON.parse(rawMessage.toString()) as ClientToCalliopeMessage
				ClientMessageHandlerService.handleMessage(message, userId, ctx.websocket)
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
	}),
)

app
	.use(HttpErrorHandler)
	.use(
		bodyParser({
			enableTypes: ['text', 'json', 'form'],
		}),
	)
	.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			sourceFilePaths: [],
		}),
	)

initRedisConnection()
app.listen(3001)
console.info('Server up')
