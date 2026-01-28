import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
import { WikiService } from '@src/services/WikiService.js'
import {
	BadRequestError,
	BooleanValidator,
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useQueryParams,
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

	const { acceptDeltas } = useQueryParams(ctx, {
		acceptDeltas: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	const article = await WikiService.findArticleById({ id: articleId, worldId })
	if (!article) {
		throw new BadRequestError('Article not found')
	}

	return {
		hasDeltas: article.contentYjs ? true : false,
		contentHtml: acceptDeltas && article.contentYjs ? undefined : article.contentRich,
		contentDeltas: acceptDeltas ? article.contentYjs : undefined,
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

	const { content, contentDeltas } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
		contentDeltas: OptionalParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })

	const article = await WikiService.updateWikiArticle({
		id: articleId,
		contentRich: parsed.contentRich,
		contentYjs: contentDeltas ?? null,
		mentions: parsed.mentions,
	})

	RedisService.notifyAboutWikiArticleUpdate(ctx, { worldId, article })
})

export const WikiArticleContentRouter = router
