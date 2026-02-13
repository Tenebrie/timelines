import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SearchModeShape, WorldSearchService } from '@src/services/WorldSearchService.js'
import {
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useQueryParams,
} from 'moonflower'
import { z } from 'zod'

import { tagListTag, worldDetailsTag, worldSearchTag } from './utils/tags.js'

const router = new Router()

export const SearchModeValidator = RequiredParam<z.infer<typeof SearchModeShape>>({
	parse: SearchModeShape.parse,
})

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

	const { mode } = useQueryParams(ctx, {
		mode: OptionalParam(SearchModeValidator),
	})

	return await WorldSearchService.search({
		worldId,
		query,
		mode: mode ?? 'string_match',
		include: ['actor', 'article', 'event', 'tag'],
	})
})

export const WorldSearchRouter = router
