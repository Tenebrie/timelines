import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { WorldSearchService } from '@src/services/WorldSearchService'
import { PathParam, Router, StringValidator, useApiEndpoint, useAuth, usePathParams } from 'moonflower'

import { worldDetailsTag } from './WorldRouter'

const router = new Router()

const worldSearchTag = 'worldSearch'

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

	const [events, actors] = await Promise.all([
		WorldSearchService.findEvents(worldId, query),
		WorldSearchService.findActors(worldId, query),
	])

	return {
		events,
		actors,
	}
})

export const WorldSearchRouter = router
