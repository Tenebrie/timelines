import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { EntityNameService } from '@src/services/EntityNameService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
import { ValidationService } from '@src/services/ValidationService.js'
import { WorldEventService } from '@src/services/WorldEventService.js'
import {
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

	const { acceptDeltas } = useQueryParams(ctx, {
		acceptDeltas: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const event = await WorldEventService.fetchWorldEvent(eventId)

	return {
		hasDeltas: event.descriptionYjs ? true : false,
		contentHtml: acceptDeltas && event.descriptionYjs ? undefined : event.descriptionRich,
		contentDeltas: acceptDeltas ? event.descriptionYjs : undefined,
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

	const { content, contentDeltas } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
		contentDeltas: OptionalParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })
	console.log(parsed.mentions)

	const baseEvent = await WorldEventService.fetchWorldEvent(eventId)
	const entityName = EntityNameService.getEventUpdateName({
		name: baseEvent.name,
		description: parsed.contentPlain,
		customNameEnabled: baseEvent.customName,
	})

	const { event } = await WorldEventService.updateWorldEvent({
		worldId,
		eventId,
		params: {
			name: entityName,
			description: parsed.contentPlain,
			descriptionRich: parsed.contentRich,
			descriptionYjs: contentDeltas ?? null,
			mentions: parsed.mentions,
		},
	})
	console.log(event)

	RedisService.notifyAboutWorldEventUpdate(ctx, { worldId, event })
})

export const WorldEventContentRouter = router
