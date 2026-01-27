import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
import { WikiService } from '@src/services/WikiService.js'
import {
	BadRequestError,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { worldWikiArticleTag } from './utils/tags.js'
import { ContentStringValidator } from './validators/ContentStringValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	return {
		user: await useAuth(ctx, UserAuthenticator),
	}
})

router.get('/api/world/:worldId/article/:articleId/content', async (ctx) => {
	useApiEndpoint({
		name: 'getWikiArticleContent',
		description: 'Fetches the content of the specified wiki article.',
		tags: [worldWikiArticleTag],
	})

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	const article = await WikiService.findArticleById({ id: articleId, worldId })
	if (!article) {
		throw new BadRequestError('Article not found')
	}

	return {
		contentRich: article.contentRich,
	}
})

router.put('/api/world/:worldId/article/:articleId/content', async (ctx) => {
	useApiEndpoint({
		name: 'putWikiArticleContent',
		description: 'Updates the content of the specified wiki article.',
		tags: [worldWikiArticleTag],
	})

	const { worldId, articleId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		articleId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const { content } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })

	const article = await WikiService.updateWikiArticle({
		id: articleId,
		contentRich: parsed.contentRich,
		mentions: parsed.mentions,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article })
})

export const WikiArticleContentRouter = router
