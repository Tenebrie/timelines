import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'tenebrie-framework'

import { ActorRouter } from './routers/ActorRouter'
import { AuthRouter } from './routers/AuthRouter'
import { WorldRouter } from './routers/WorldRouter'
import { initRedisConnection } from './services/RedisService'

const app = new Koa()

useApiHeader({
	title: 'Timelines Rhea',
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

app
	.use(HttpErrorHandler)
	.use(
		bodyParser({
			enableTypes: ['text', 'json', 'form'],
		})
	)
	.use(ActorRouter.routes())
	.use(ActorRouter.allowedMethods())
	.use(AuthRouter.routes())
	.use(AuthRouter.allowedMethods())
	.use(WorldRouter.routes())
	.use(WorldRouter.allowedMethods())
	.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			sourceFilePaths: [
				'./src/routers/ActorRouter.ts',
				'./src/routers/AuthRouter.ts',
				'./src/routers/WorldRouter.ts',
			],
		})
	)

initRedisConnection()
app.listen(3000)
console.info('[RHEA] Server up')
