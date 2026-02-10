import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { WorldSearchService } from '@src/services/WorldSearchService.js'
import { PathParam, Router, StringValidator, useApiEndpoint, useAuth, usePathParams } from 'moonflower'

import { worldDetailsTag, worldSearchTag } from './utils/tags.js'

const router = new Router()

router.get('/api/world/:worldId/search/:query', async (ctx) => {
	useApiEndpoint({
		name: 'searchWorld',
		description: 'Searches all eligible world entities.',
		tags: [worldSearchTag, worldDetailsTag],
	})

	await useAuth(ctx, UserAuthenticator)

	const { worldId, query } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		query: PathParam(StringValidator),
	})

	const [events, actors, articles] = await Promise.all([
		WorldSearchService.findEvents(worldId, query),
		WorldSearchService.findActors(worldId, query),
		WorldSearchService.findArticles(worldId, query),
	])

	return {
		events,
		actors,
		articles,
	}
})

export const WorldSearchRouter = router
