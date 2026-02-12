import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { ActorService } from '@src/services/ActorService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
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

import { actorListTag } from './utils/tags.js'
import { ContentStringValidator } from './validators/ContentStringValidator.js'
import { NameStringValidator } from './validators/NameStringValidator.js'

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

	const { acceptDeltas } = useQueryParams(ctx, {
		acceptDeltas: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	const actor = await ActorService.findActorWithContentDeltas({ worldId, actorId })
	if (!actor) {
		throw new BadRequestError('Actor not found')
	}

	return {
		hasDeltas: actor.descriptionYjs ? true : false,
		contentHtml: acceptDeltas && actor.descriptionYjs ? undefined : actor.descriptionRich,
		contentDeltas: acceptDeltas ? actor.descriptionYjs : undefined,
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

	const { content, contentDeltas } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
		contentDeltas: OptionalParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })

	const { actor } = await ActorService.updateActor({
		worldId,
		actorId,
		params: {
			description: parsed.contentPlain,
			descriptionRich: parsed.contentRich,
			descriptionYjs: contentDeltas ?? null,
			mentions: parsed.mentions,
		},
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })
})

router.get('/api/world/:worldId/actor/:actorId/content/pages/:pageId', async (ctx) => {
	useApiEndpoint({
		name: 'getActorContentPage',
		description: 'Fetches the content of the specified page for the actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId, pageId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
		pageId: PathParam(StringValidator),
	})

	const { acceptDeltas } = useQueryParams(ctx, {
		acceptDeltas: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	const page = await ActorService.getActorContentPage({ worldId, actorId, pageId })
	if (!page) {
		throw new BadRequestError('Page not found')
	}

	return {
		hasDeltas: page.descriptionYjs ? true : false,
		contentHtml: acceptDeltas && page.descriptionYjs ? undefined : page.descriptionRich,
		contentDeltas: acceptDeltas ? page.descriptionYjs : undefined,
	}
})

router.post('/api/world/:worldId/actor/:actorId/content/pages', async (ctx) => {
	useApiEndpoint({
		name: 'createActorContentPage',
		description: 'Creates a new content page for the specified actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const { name } = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
	})

	const { actor, page } = await ActorService.createActorContentPage({
		worldId,
		actorId,
		name,
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })

	return page
})

router.put('/api/world/:worldId/actor/:actorId/content/pages/:pageId', async (ctx) => {
	useApiEndpoint({
		name: 'putActorContentPage',
		description: 'Updates the content of the specified page for the actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId, pageId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
		pageId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const { content, contentDeltas } = useRequestBody(ctx, {
		content: RequiredParam(ContentStringValidator),
		contentDeltas: OptionalParam(ContentStringValidator),
	})

	const parsed = await RichTextService.parseContentString({ worldId, contentString: content })
	const page = await ActorService.getActorContentPage({ worldId, actorId, pageId })
	if (!page) {
		throw new Error('Page not found')
	}

	const actor = await ActorService.updateActorContentPage({
		worldId,
		actorId,
		pageId,
		params: {
			description: parsed.contentPlain,
			descriptionRich: parsed.contentRich,
			descriptionYjs: contentDeltas ?? null,
			mentions: parsed.mentions,
		},
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })
})

router.delete('/api/world/:worldId/actor/:actorId/content/pages/:pageId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteActorContentPage',
		description: 'Deletes a content page from the specified actor.',
		tags: [actorListTag],
	})

	const { worldId, actorId, pageId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
		pageId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const actor = await ActorService.deleteActorContentPage({
		worldId,
		actorId,
		pageId,
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })
})

export const ActorContentRouter = router
