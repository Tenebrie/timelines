import './registerModuleAlias'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'moonflower'

import { ActorRouter } from './routers/ActorRouter'
import { AdminRouter } from './routers/AdminRouter'
import { AnnouncementRouter } from './routers/AnnouncementRouter'
import { AssetUploadRouter } from './routers/AssetRouter'
import { AuthRouter } from './routers/AuthRouter'
import { ConstantsRouter } from './routers/ConstantsRouter'
import { HealthRouter } from './routers/HealthRouter'
import { ImageConversionRouter } from './routers/ImageConversionRouter'
import { ProfileRouter } from './routers/ProfileRouter'
import { WorldEventRouter } from './routers/WorldEventRouter'
import { WorldEventTrackRouter } from './routers/WorldEventTrackRouter'
import { WorldRouter } from './routers/WorldRouter'
import { WorldSearchRouter } from './routers/WorldSearchRouter'
import { WorldThumbnailRouter } from './routers/WorldThumbnailRouter'
import { WorldWikiRouter } from './routers/WorldWikiRouter'
import { RedisService } from './services/RedisService'
import { UserService } from './services/UserService'
import { isRunningInTest } from './utils/isRunningInTest'

export const app = new Koa()

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
		}),
	)
	.use(ActorRouter.routes())
	.use(ActorRouter.allowedMethods())
	.use(AdminRouter.routes())
	.use(AdminRouter.allowedMethods())
	.use(AnnouncementRouter.routes())
	.use(AnnouncementRouter.allowedMethods())
	.use(AssetUploadRouter.routes())
	.use(AssetUploadRouter.allowedMethods())
	.use(AuthRouter.routes())
	.use(AuthRouter.allowedMethods())
	.use(ConstantsRouter.routes())
	.use(ConstantsRouter.allowedMethods())
	.use(HealthRouter.routes())
	.use(HealthRouter.allowedMethods())
	.use(ImageConversionRouter.routes())
	.use(ImageConversionRouter.allowedMethods())
	.use(ProfileRouter.routes())
	.use(ProfileRouter.allowedMethods())
	.use(WorldEventRouter.routes())
	.use(WorldEventRouter.allowedMethods())
	.use(WorldEventTrackRouter.routes())
	.use(WorldEventTrackRouter.allowedMethods())
	.use(WorldRouter.routes())
	.use(WorldRouter.allowedMethods())
	.use(WorldSearchRouter.routes())
	.use(WorldSearchRouter.allowedMethods())
	.use(WorldThumbnailRouter.routes())
	.use(WorldThumbnailRouter.allowedMethods())
	.use(WorldWikiRouter.routes())
	.use(WorldWikiRouter.allowedMethods())

if (!isRunningInTest()) {
	app.use(
		initOpenApiEngine({
			tsconfigPath: './tsconfig.json',
			logLevel: 'info',
			sourceFileDiscovery: {
				rootPath: './src/routers',
			},
		}),
	)

	RedisService.initRedisConnection()
	app.listen(3000)
	console.info('[RHEA] Server up')

	setInterval(() => {
		UserService.cleanUpDeletedUsers()
	}, 60000)
}
