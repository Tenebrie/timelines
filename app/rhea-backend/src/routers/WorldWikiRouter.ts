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

export const worldWikiTag = 'worldWiki'

router.get('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'getArticles',
		description: 'Returns a list of articles in the wiki without content.',
		tags: [worldWikiTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const articles = await WikiService.listWikiArticles({ worldId })
	return articles.sort((a, b) => a.position - b.position)
})

router.post('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'createArticle',
		description: 'Creates a new article in the wiki.',
		tags: [worldWikiTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { name } = useRequestBody(ctx, {
		name: RequiredParam(StringValidator),
	})

	const articleCount = await WikiService.getArticleCount({ worldId })

	return WikiService.createWikiArticle({
		worldId,
		name,
		position: articleCount,
	})
})

router.patch('/api/world/:worldId/wiki/article/:articleId', async (ctx) => {
	useApiEndpoint({
		name: 'updateArticle',
		description: 'Updates an article in the wiki.',
		tags: [worldWikiTag],
	})

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	const { name, contentRich, mentionedActors, mentionedEvents, mentionedTags } = useRequestBody(ctx, {
		name: OptionalParam(StringValidator),
		contentRich: OptionalParam(StringValidator),
		mentionedActors: OptionalParam(StringArrayValidator),
		mentionedEvents: OptionalParam(StringArrayValidator),
		mentionedTags: OptionalParam(StringArrayValidator),
	})

	return WikiService.updateWikiArticle({
		id: articleId,
		worldId,
		name,
		contentRich,
		mentionedActors,
		mentionedEvents,
		mentionedTags,
	})
})

export const WorldWikiRouter = router
