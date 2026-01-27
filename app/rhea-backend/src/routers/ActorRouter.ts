import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { ActorService } from '@src/services/ActorService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { EntityNameService } from '@src/services/EntityNameService.js'
import { MentionData } from '@src/services/MentionsService.js'
import { RedisService } from '@src/services/RedisService.js'
import { RichTextService } from '@src/services/RichTextService.js'
import {
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { actorListTag, worldDetailsTag } from './utils/tags.js'
import { ContentStringValidator } from './validators/ContentStringValidator.js'
import { NameStringValidator } from './validators/NameStringValidator.js'
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator.js'

const router = new Router().with(SessionMiddleware)

router.post('/api/world/:worldId/actors', async (ctx) => {
	useApiEndpoint({
		name: 'createActor',
		description: 'Creates a new actor',
		tags: [actorListTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		title: OptionalParam(OptionalNameStringValidator),
		icon: OptionalParam(NameStringValidator),
		color: OptionalParam(NameStringValidator),
		descriptionRich: OptionalParam(ContentStringValidator),
	})

	let description: string | undefined
	let descriptionRich: string | undefined
	let mentions: MentionData[] | undefined
	if (params.descriptionRich) {
		const parsed = await RichTextService.parseContentString({
			worldId,
			contentString: params.descriptionRich,
		})
		params.name = EntityNameService.getEventCreateName({
			name: params.name,
			description: parsed.contentPlain,
		})
		description = parsed.contentPlain
		descriptionRich = params.descriptionRich
		mentions = parsed.mentions
	}

	const { actor, world } = await ActorService.createActor({
		worldId,
		createData: {
			name: params.name,
		},
		updateData: {
			...params,
			description,
			descriptionRich,
			mentions,
		},
	})

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

	return actor
})

router.patch('/api/world/:worldId/actor/:actorId', async (ctx) => {
	useApiEndpoint({
		name: 'updateActor',
		description: 'Updates the target actor',
		tags: [actorListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, actorId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		title: OptionalParam(OptionalNameStringValidator),
		icon: OptionalParam(NameStringValidator),
		color: OptionalParam(NameStringValidator),
	})

	const { actor } = await ActorService.updateActor({
		worldId,
		actorId,
		params,
	})

	RedisService.notifyAboutActorUpdate(ctx, { worldId, actor })

	return actor
})

router.delete('/api/world/:worldId/actor/:actorId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteActor',
		description: 'Deletes the target actor',
		tags: [actorListTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, actorId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		actorId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const { actor, world } = await ActorService.deleteActor({ worldId, actorId })

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

	return actor
})

export const ActorRouter = router
