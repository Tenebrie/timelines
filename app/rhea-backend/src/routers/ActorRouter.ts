import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { ActorService } from '@src/services/ActorService'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { RedisService } from '@src/services/RedisService'
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

import { ContentStringValidator } from './validators/ContentStringValidator'
import { MentionsArrayValidator } from './validators/MentionsArrayValidator'
import { NameStringValidator } from './validators/NameStringValidator'
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator'
import { worldDetailsTag } from './WorldRouter'

const router = new Router()

const actorListTag = 'actorList'

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
		color: OptionalParam(NameStringValidator),
		description: OptionalParam(ContentStringValidator),
		mentions: OptionalParam(MentionsArrayValidator),
	})

	const { actor, world } = await ActorService.createActor(worldId, params)

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return actor
})

router.patch('/api/world/:worldId/actor/:actorId', async (ctx) => {
	useApiEndpoint({
		name: 'updateActor',
		description: 'Updates the target actor',
		tags: [actorListTag, worldDetailsTag],
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
		color: OptionalParam(NameStringValidator),
		description: OptionalParam(ContentStringValidator),
	})

	const { actor, world } = await ActorService.updateActor({ worldId, actorId, params })

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

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

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return actor
})

export const ActorRouter = router
