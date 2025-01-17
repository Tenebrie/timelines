import { WikiService } from '@src/services/WikiService'
import {
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { StringArrayValidator } from './validators/StringArrayValidator'

const router = new Router()

router.get('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'getArticles',
		description: 'Returns a list of articles in the wiki without content.',
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	return WikiService.listWikiArticles({ worldId })
})

router.post('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'createArticle',
		description: 'Creates a new article in the wiki.',
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { name } = useRequestBody(ctx, {
		name: RequiredParam(StringValidator),
	})

	return WikiService.createWikiArticle({
		worldId,
		name,
	})
})

router.patch('/api/world/:worldId/wiki/article/:articleId', async (ctx) => {
	useApiEndpoint({
		name: 'updateArticle',
		description: 'Updates an article in the wiki.',
	})

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	const { name, descriptionRich, mentionedActors, mentionedEvents, mentionedTags } = useRequestBody(ctx, {
		name: OptionalParam(StringValidator),
		descriptionRich: OptionalParam(StringValidator),
		mentionedActors: OptionalParam(StringArrayValidator),
		mentionedEvents: OptionalParam(StringArrayValidator),
		mentionedTags: OptionalParam(StringArrayValidator),
	})

	return WikiService.updateWikiArticle({
		id: articleId,
		worldId,
		name,
		descriptionRich,
		mentionedActors,
		mentionedEvents,
		mentionedTags,
	})
})

export const WikiRouter = router
