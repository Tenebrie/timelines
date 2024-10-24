import './registerModuleAlias'

import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'tenebrie-framework'

import { ActorRouter } from './routers/ActorRouter'
import { AdminRouter } from './routers/AdminRouter'
import { AnnouncementRouter } from './routers/AnnouncementRouter'
import { AuthRouter } from './routers/AuthRouter'
import { WorldEventRouter } from './routers/WorldEventRouter'
import { WorldRouter } from './routers/WorldRouter'
import { RedisService } from './services/RedisService'

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
		name: 'Unlicensed',
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
	.use(AdminRouter.routes())
	.use(AdminRouter.allowedMethods())
	.use(AnnouncementRouter.routes())
	.use(AnnouncementRouter.allowedMethods())
	.use(AuthRouter.routes())
	.use(AuthRouter.allowedMethods())
	.use(WorldEventRouter.routes())
	.use(WorldEventRouter.allowedMethods())
	.use(WorldRouter.routes())
	.use(WorldRouter.allowedMethods())
	.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			sourceFilePaths: [
				'./src/routers/ActorRouter.ts',
				'./src/routers/AdminRouter.ts',
				'./src/routers/AnnouncementRouter.ts',
				'./src/routers/AuthRouter.ts',
				'./src/routers/WorldEventRouter.ts',
				'./src/routers/WorldRouter.ts',
			],
		})
	)

RedisService.initRedisConnection()
app.listen(3000)
console.info('[RHEA] Server up')
