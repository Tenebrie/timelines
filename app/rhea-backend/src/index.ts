import chalk from 'chalk'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { HttpErrorHandler, initOpenApiEngine, useApiHeader } from 'moonflower'

import { ActorContentRouter } from './routers/ActorContentRouter.js'
import { ActorRouter } from './routers/ActorRouter.js'
import { AdminRouter } from './routers/AdminRouter.js'
import { AnnouncementRouter } from './routers/AnnouncementRouter.js'
import { AssetUploadRouter } from './routers/AssetRouter.js'
import { AuthRouter } from './routers/AuthRouter.js'
import { CalendarRouter } from './routers/CalendarRouter.js'
import { ConstantsRouter } from './routers/ConstantsRouter.js'
import { HealthRouter, HealthStatus } from './routers/HealthRouter.js'
import { IconsRouter } from './routers/IconsRouter.js'
import { ImageConversionRouter } from './routers/ImageConversionRouter.js'
import { ClientAuthRouter } from './routers/internal/ClientAuthRouter.js'
import { MindmapRouter } from './routers/MindmapRouter.js'
import { ProfileRouter } from './routers/ProfileRouter.js'
import { TagRouter } from './routers/TagRouter.js'
import { WikiArticleContentRouter } from './routers/WikiArticleContentRouter.js'
import { WorldColorRouter } from './routers/WorldColorRouter.js'
import { WorldEventContentRouter } from './routers/WorldEventContentRouter.js'
import { WorldEventRouter } from './routers/WorldEventRouter.js'
import { WorldEventTrackRouter } from './routers/WorldEventTrackRouter.js'
import { WorldRouter } from './routers/WorldRouter.js'
import { WorldSearchRouter } from './routers/WorldSearchRouter.js'
import { WorldThumbnailRouter } from './routers/WorldThumbnailRouter.js'
import { WorldWikiRouter } from './routers/WorldWikiRouter.js'
import { CloudStorageService } from './services/CloudStorageService.js'
import { RedisService } from './services/RedisService.js'
import { UserService } from './services/UserService.js'
import { isRunningInTest } from './utils/isRunningInTest.js'

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
	// Public routers
	.use(ActorContentRouter.routes())
	.use(ActorContentRouter.allowedMethods())
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
	.use(CalendarRouter.routes())
	.use(CalendarRouter.allowedMethods())
	.use(ConstantsRouter.routes())
	.use(ConstantsRouter.allowedMethods())
	.use(HealthRouter.routes())
	.use(HealthRouter.allowedMethods())
	.use(IconsRouter.routes())
	.use(IconsRouter.allowedMethods())
	.use(ImageConversionRouter.routes())
	.use(ImageConversionRouter.allowedMethods())
	.use(MindmapRouter.routes())
	.use(MindmapRouter.allowedMethods())
	.use(ProfileRouter.routes())
	.use(ProfileRouter.allowedMethods())
	.use(TagRouter.routes())
	.use(TagRouter.allowedMethods())
	.use(WikiArticleContentRouter.routes())
	.use(WikiArticleContentRouter.allowedMethods())
	.use(WorldEventContentRouter.routes())
	.use(WorldEventContentRouter.allowedMethods())
	.use(WorldEventRouter.routes())
	.use(WorldEventRouter.allowedMethods())
	.use(WorldEventTrackRouter.routes())
	.use(WorldEventTrackRouter.allowedMethods())
	.use(WorldRouter.routes())
	.use(WorldRouter.allowedMethods())
	.use(WorldColorRouter.routes())
	.use(WorldColorRouter.allowedMethods())
	.use(WorldSearchRouter.routes())
	.use(WorldSearchRouter.allowedMethods())
	.use(WorldThumbnailRouter.routes())
	.use(WorldThumbnailRouter.allowedMethods())
	.use(WorldWikiRouter.routes())
	.use(WorldWikiRouter.allowedMethods())
	// Internal use routers
	.use(ClientAuthRouter.routes())
	.use(ClientAuthRouter.allowedMethods())

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
	console.info(`${chalk.greenBright('[Rhea]')} Listening on port ${chalk.blueBright('3000')}`)
	HealthStatus.markRheaAsReady()

	setInterval(() => {
		UserService.cleanUpDeletedUsers()
		UserService.cleanUpTestUsers()
		CloudStorageService.cleanUpExpiredAssets()
	}, 60000)
}
