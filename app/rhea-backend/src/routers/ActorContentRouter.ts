import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { ActorService } from '@src/services/ActorService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
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

import { actorListTag } from './utils/tags.js'
import { ContentStringValidator } from './validators/ContentStringValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	return {
		user: await useAuth(ctx, UserAuthenticator),
	}
})

router.get('/api/world/:worldId/actor/:actorId/content', async (ctx) => {
	useApiEndpoint({
		name: 'getActorContent',
		description: 'Fetches the content of the specified actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	const actor = await ActorService.findActor({ worldId, actorId })
	if (!actor) {
		throw new BadRequestError('Actor not found')
	}
	return {
		contentRich: actor.descriptionRich,
	}
})

router.put('/api/world/:worldId/actor/:actorId/content', async (ctx) => {
	useApiEndpoint({
		name: 'putActorContent',
		description: 'Updates the content of the specified actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const { content } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })

	const { actor } = await ActorService.updateActor({
		worldId,
		actorId,
		params: {
			description: parsed.contentPlain,
			descriptionRich: parsed.contentRich,
			mentions: parsed.mentions,
		},
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })
})

export const ActorContentRouter = router
