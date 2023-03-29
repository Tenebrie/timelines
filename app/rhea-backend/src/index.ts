import 'module-alias/register'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'tenebrie-framework'

import { AuthRouter } from './routers/AuthRouter'
import { WorldRouter } from './routers/WorldRouter'

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
	.use(AuthRouter.routes())
	.use(AuthRouter.allowedMethods())
	.use(WorldRouter.routes())
	.use(WorldRouter.allowedMethods())
	.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			sourceFilePaths: ['./src/routers/AuthRouter.ts', './src/routers/WorldRouter.ts'],
		})
	)

app.listen(3000)
console.info('[RHEA] Server up')
