import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { WorldService } from '@src/services/WorldService'
import {
	BadRequestError,
	NonEmptyStringValidator,
	NumberValidator,
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'tenebrie-framework'

import { StringArrayValidator } from './validators/StringArrayValidator'
import { WorldCalendarTypeValidator } from './validators/WorldCalendarTypeValidator'

const router = new Router()

export const worldListTag = 'worldList'
export const worldDetailsTag = 'worldDetails'

router.get('/api/worlds', async (ctx) => {
	useApiEndpoint({
		name: 'getWorlds',
		description: 'Lists all worlds accessible for the current user.',
		tags: [worldListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	return await WorldService.listOwnedWorlds({ owner: user })
})

router.post('/api/world', async (ctx) => {
	useApiEndpoint({
		name: 'createWorld',
		description: 'Creates a new world (project).',
		tags: [worldListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NonEmptyStringValidator),
		calendar: OptionalParam(WorldCalendarTypeValidator),
		timeOrigin: OptionalParam(NumberValidator),
	})

	const world = await WorldService.createWorld({
		owner: user,
		...params,
	})

	return world
})

router.delete('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorld',
		description: 'Destroys a world owned by the current user.',
		tags: [worldListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	return await WorldService.deleteWorld(worldId)
})

router.get('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldInfo',
		description: 'Returns all information about a world.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccess(user, worldId)

	return await WorldService.findWorldDetails(worldId)
})

router.post('/api/world/:worldId/share', async (ctx) => {
	useApiEndpoint({
		name: 'shareWorld',
		description: 'Shares the world with the target users.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { userEmails } = useRequestBody(ctx, {
		userEmails: RequiredParam(StringArrayValidator),
	})

	if (userEmails.length > 20) {
		throw new BadRequestError('Unable to share to more than 20 users at once.')
	}

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldService.shareWorld(worldId, userEmails)
})

router.delete('/api/world/:worldId/share/:userEmail', async (ctx) => {
	useApiEndpoint({
		name: 'unshareWorld',
		description: "Removes the target user's access to this world.",
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, userEmail } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		userEmail: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldService.unshareWorld({
		worldId,
		userEmail,
	})
})

export const WorldRouter = router
