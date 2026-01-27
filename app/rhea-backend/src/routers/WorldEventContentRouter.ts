import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RichTextService } from '@src/services/RichTextService.js'
import { ValidationService } from '@src/services/ValidationService.js'
import { WorldEventService } from '@src/services/WorldEventService.js'
import {
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { worldEventTag } from './utils/tags.js'
import { ContentStringValidator } from './validators/ContentStringValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	return {
		user: await useAuth(ctx, UserAuthenticator),
	}
})

router.get('/api/world/:worldId/event/:eventId/content', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldEventContent',
		description: 'Fetches the content of the specified world event.',
		tags: [worldEventTag],
	})

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const event = await WorldEventService.fetchWorldEvent(eventId)
	return {
		contentRich: event.description,
	}
})

router.put('/api/world/:worldId/event/:eventId/content', async (ctx) => {
	useApiEndpoint({
		name: 'putWorldEventContent',
		description: 'Updates the content of the specified world event.',
		tags: [worldEventTag],
	})

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const { content } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })

	await WorldEventService.updateWorldEvent({
		worldId,
		eventId,
		params: {
			description: parsed.contentPlain,
			descriptionRich: parsed.contentRich,
			mentions: parsed.mentions,
		},
	})
})

export const WorldEventContentRouter = router
