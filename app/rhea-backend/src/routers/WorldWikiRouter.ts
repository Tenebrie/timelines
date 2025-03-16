import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { RedisService } from '@src/services/RedisService'
import { WikiService } from '@src/services/WikiService'
import {
	NumberValidator,
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useOptionalAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { SessionMiddleware } from '../middleware/SessionMiddleware'
import { MentionsArrayValidator } from './validators/MentionsArrayValidator'
import { StringArrayValidator } from './validators/StringArrayValidator'

const router = new Router().with(SessionMiddleware)

export const worldWikiTag = 'worldWiki'

router.get('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'getArticles',
		description: 'Returns a list of articles in the wiki without content.',
		tags: [worldWikiTag],
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(user, worldId)

	const articles = await WikiService.listWikiArticles({ worldId })
	return articles.sort((a, b) => a.position - b.position)
})

router.post('/api/world/:worldId/wiki/articles', async (ctx) => {
	useApiEndpoint({
		name: 'createArticle',
		description: 'Creates a new article in the wiki.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const { name } = useRequestBody(ctx, {
		name: RequiredParam(StringValidator),
	})

	const articleCount = await WikiService.getArticleCount({ worldId })

	const article = await WikiService.createWikiArticle({
		worldId,
		name,
		position: articleCount,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article })

	return article
})

router.patch('/api/world/:worldId/wiki/article/:articleId', async (ctx) => {
	useApiEndpoint({
		name: 'updateArticle',
		description: 'Updates an article in the wiki.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const { name, contentRich, mentions } = useRequestBody(ctx, {
		name: OptionalParam(StringValidator),
		icon: OptionalParam(StringValidator),
		color: OptionalParam(StringValidator),
		contentRich: OptionalParam(StringValidator),
		mentions: OptionalParam(MentionsArrayValidator),
	})

	const article = await WikiService.updateWikiArticle({
		id: articleId,
		name,
		contentRich,
		mentions,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article })

	return article
})

router.post('/api/world/:worldId/wiki/article/move', async (ctx) => {
	useApiEndpoint({
		name: 'moveArticle',
		description: 'Moves an article to a new position.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		articleId: RequiredParam(StringValidator),
		position: RequiredParam(NumberValidator),
	})

	const { article } = await WikiService.moveWikiArticle({
		worldId,
		articleId: params.articleId,
		toPosition: params.position,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article })
})

router.post('/api/world/:worldId/wiki/article/swap', async (ctx) => {
	useApiEndpoint({
		name: 'swapArticlePositions',
		description: 'Swaps the position of two articles.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		articleA: RequiredParam(StringValidator),
		articleB: RequiredParam(StringValidator),
	})

	const { articleA, articleB } = await WikiService.swapWikiArticlePositions({
		worldId,
		articleIdA: params.articleA,
		articleIdB: params.articleB,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article: articleA })
	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article: articleB })
})

router.delete('/api/world/:worldId/wiki/article/:articleId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteArticle',
		description: 'Deletes an article from the wiki.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	await WikiService.deleteWikiArticle({ worldId, articleId })

	RedisService.notifyAboutWikiArticleDeletion(ctx, { worldId })
})

router.post('/api/world/:worldId/wiki/articles/delete', async (ctx) => {
	useApiEndpoint({
		name: 'bulkDeleteArticles',
		description: 'Deletes a number of articles from the wiki.',
		tags: [worldWikiTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { articles } = useRequestBody(ctx, {
		articles: RequiredParam(StringArrayValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	await WikiService.bulkDeleteWikiArticles({ worldId, articles })

	RedisService.notifyAboutWikiArticleDeletion(ctx, { worldId })
})

export const WorldWikiRouter = router
