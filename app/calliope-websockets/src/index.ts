import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as route from 'koa-route'
import * as websocketify from 'koa-websocket'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'tenebrie-framework'

import { initRedisConnection } from './services/RedisService'
import { TokenService } from './services/TokenService'
import { WebsocketService } from './services/WebsocketService'

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

		const { id: userId, email: userEmail } = TokenService.decodeJwtToken(authCookie)

		ctx.websocket.on('open', () => {
			console.log('Client connected!')
		})
		ctx.websocket.on('message', (rawMessage) => {
			const message = String(rawMessage)
			if (message === 'init') {
				WebsocketService.registerClient(userId, ctx.websocket)
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

app
	.use(HttpErrorHandler)
	.use(
		bodyParser({
			enableTypes: ['text', 'json', 'form'],
		})
	)
	.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			sourceFilePaths: [],
		})
	)

initRedisConnection()
app.listen(3001)
console.info('[CALLIOPE] Server up')
