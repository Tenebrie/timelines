import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { WorldService } from '@src/services/WorldService'
import { WorldShareService } from '@src/services/WorldShareService'
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
	useOptionalAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { CollaboratorAccessValidator } from './validators/CollaboratorAccessValidator'
import { StringArrayValidator } from './validators/StringArrayValidator'
import { WorldAccessModeValidator } from './validators/WorldAccessModeValidator'
import { WorldCalendarTypeValidator } from './validators/WorldCalendarTypeValidator'

const router = new Router()

export const worldListTag = 'worldList'
export const worldDetailsTag = 'worldDetails'
export const worldCollaboratorsTag = 'worldCollaborators'

router.get('/api/worlds', async (ctx) => {
	useApiEndpoint({
		name: 'getWorlds',
		description: 'Lists all worlds accessible for the current user.',
		tags: [worldListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	return await WorldService.listAvailableWorlds({ owner: user })
})

router.post('/api/worlds', async (ctx) => {
	useApiEndpoint({
		name: 'createWorld',
		description: 'Creates a new world (project).',
		tags: [worldListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NonEmptyStringValidator),
		description: OptionalParam(StringValidator),
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

router.patch('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorld',
		description: 'Updates the world information.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const params = useRequestBody(ctx, {
		name: OptionalParam(NonEmptyStringValidator),
		description: OptionalParam(StringValidator),
		calendar: OptionalParam(WorldCalendarTypeValidator),
		timeOrigin: OptionalParam(NumberValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldService.updateWorld({
		worldId,
		data: params,
	})
})

router.get('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldInfo',
		description: 'Returns all information about a world.',
		tags: [worldDetailsTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const worldDetails = await WorldService.findWorldDetails(worldId)
	const user = await useOptionalAuth(ctx, UserAuthenticator)

	await AuthorizationService.checkUserReadAccess(user, worldDetails)

	return {
		...worldDetails,
		isReadOnly: !(await AuthorizationService.canUserEditWorld(worldDetails, user)),
	}
})

router.get('/api/world/:worldId/brief', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldBrief',
		description: 'Returns summarized information about a world.',
		tags: [worldDetailsTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const worldBrief = await WorldService.findWorldBrief(worldId)
	const user = await useOptionalAuth(ctx, UserAuthenticator)

	await AuthorizationService.checkUserReadAccess(user, worldBrief)

	return worldBrief
})

router.get('/api/world/:worldId/collaborators', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldCollaborators',
		description: 'List the collaborating users',
		tags: [worldCollaboratorsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	return await WorldShareService.listCollaborators({ worldId })
})

router.post('/api/world/:worldId/share', async (ctx) => {
	useApiEndpoint({
		name: 'shareWorld',
		description: 'Shares the world with the target users.',
		tags: [worldCollaboratorsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { userEmails, access } = useRequestBody(ctx, {
		userEmails: RequiredParam(StringArrayValidator),
		access: RequiredParam(CollaboratorAccessValidator),
	})

	if (userEmails.length > 20) {
		throw new BadRequestError('Unable to share to more than 20 users at once.')
	}

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldShareService.addCollaborators({ worldId, userEmails, access })
})

router.post('/api/world/:worldId/access', async (ctx) => {
	useApiEndpoint({
		name: 'setWorldAccessMode',
		description: "Changes the world's access mode.",
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const { access } = useRequestBody(ctx, {
		access: RequiredParam(WorldAccessModeValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldService.updateWorld({
		worldId,
		data: {
			accessMode: access,
		},
	})
})

router.delete('/api/world/:worldId/share/:userId', async (ctx) => {
	useApiEndpoint({
		name: 'unshareWorld',
		description: "Removes the target user's access to this world.",
		tags: [worldCollaboratorsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, userId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		userId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(user, worldId)

	await WorldShareService.removeCollaborator({
		worldId,
		userId,
	})
})

export const WorldRouter = router
