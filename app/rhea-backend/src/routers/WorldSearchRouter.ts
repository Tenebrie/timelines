import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { WorldSearchService } from '@src/services/WorldSearchService.js'
import { PathParam, Router, StringValidator, useApiEndpoint, useAuth, usePathParams } from 'moonflower'

import { tagListTag, worldDetailsTag, worldSearchTag } from './utils/tags.js'

const router = new Router()

router.get('/api/world/:worldId/search/:query', async (ctx) => {
	useApiEndpoint({
		name: 'searchWorld',
		description: 'Searches all eligible world entities.',
		tags: [worldSearchTag, worldDetailsTag, tagListTag],
	})

	await useAuth(ctx, UserAuthenticator)

	const { worldId, query } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		query: PathParam(StringValidator),
	})

	const [events, actors, articles, tags] = await Promise.all([
		WorldSearchService.findEvents(worldId, query),
		WorldSearchService.findActors(worldId, query),
		WorldSearchService.findArticles(worldId, query),
		WorldSearchService.findTags(worldId, query),
	])

	return {
		events,
		actors,
		articles,
		tags,
	}
})

export const WorldSearchRouter = router
