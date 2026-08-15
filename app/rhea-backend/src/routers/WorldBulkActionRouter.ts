import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RedisService } from '@src/services/RedisService.js'
import { BulkActionService } from '@src/services/WorldBulkActionService.js'
import {
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { SessionMiddleware } from '../middleware/SessionMiddleware.js'
import {
	actorListTag,
	worldBulkTag,
	worldDetailsTag,
	worldEventTag,
	worldWikiArticleTag,
	worldWikiFolderTag,
} from './utils/tags.js'
import { StringArrayValidator } from './validators/StringArrayValidator.js'

const router = new Router().with(SessionMiddleware)

router.post('/api/world/:worldId/bulk/delete', async (ctx) => {
	useApiEndpoint({
		name: 'bulkDeleteEntities',
		description: 'Deletes a number of entities from the world.',
		tags: [
			worldBulkTag,
			actorListTag,
			worldEventTag,
			worldWikiFolderTag,
			worldWikiArticleTag,
			worldDetailsTag,
		],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { entities } = useRequestBody(ctx, {
		entities: RequiredParam(StringArrayValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const { stats } = await BulkActionService.bulkDeleteEntities({
		worldId,
		entities,
		entityTypes: ['actor', 'article', 'folder', 'event', 'tag'],
	})

	if (stats.actorsDeleted > 0) {
		RedisService.notifyAboutActorsDelete(ctx, { worldId })
	}
	if (stats.articlesDeleted > 0) {
		RedisService.notifyAboutWikiArticlesDelete(ctx, { worldId })
	}
	if (stats.foldersDeleted > 0) {
		RedisService.notifyAboutWikiFoldersDelete(ctx, { worldId })
	}
	if (stats.eventsDeleted > 0) {
		RedisService.notifyAboutWorldEventsDelete(ctx, { worldId })
	}
	if (stats.tagsDeleted > 0) {
		RedisService.notifyAboutTagsDelete(ctx, { worldId })
	}
})

export const WorldBulkRouter = router
