import { User, World, WorldEvent, WorldEventType, WorldStatement } from '@prisma/client'
import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { WorldService } from '@src/services/WorldService'
import {
	NumberValidator,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useExposeApiModel,
	usePathParams,
	useRequestBody,
} from 'tenebrie-framework'

import { WorldEventTypeValidator } from './validators/WorldEventTypeValidator'

const router = new Router()

useExposeApiModel<User>()
useExposeApiModel<World>()
useExposeApiModel<WorldEventType>()
useExposeApiModel<WorldEvent>()
useExposeApiModel<WorldStatement>()

const worldTag = 'world'

router.get('/api/worlds', async (ctx) => {
	useApiEndpoint({
		name: 'getWorlds',
		description: 'Lists all worlds accessible for the current user.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	return await WorldService.listOwnedWorlds({ owner: user })
})

router.post('/api/world', async (ctx) => {
	useApiEndpoint({
		name: 'createWorld',
		description: 'Creates a new world (project).',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const params = useRequestBody(ctx, {
		name: RequiredParam(StringValidator),
	})

	const world = await WorldService.createWorld({
		owner: user,
		...params,
	})

	return world
})

router.get('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldInfo',
		description: 'Returns all information about a world.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserReadAccess(user, worldId)

	return await WorldService.findWorldDetails(worldId)
})

router.delete('/api/world/:worldId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorld',
		description: 'Destroys a world owned by the current user.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	await WorldService.deleteWorld(worldId)
})

router.post('/api/world/:worldId/event', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEvent',
		description: 'Creates a new world event.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		name: RequiredParam(StringValidator),
		type: RequiredParam(WorldEventTypeValidator),
		timestamp: RequiredParam(NumberValidator),
	})

	return await WorldService.createWorldEvent(worldId, params)
})

router.post('/api/world/:worldId/event/:eventId/statement/issue', async (ctx) => {
	useApiEndpoint({
		name: 'issueWorldStatement',
		description: 'Creates a new world statement and marks the specified event as the issuer.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		title: RequiredParam(StringValidator),
	})

	return await WorldService.issueWorldStatement(eventId, params)
})

router.post('/api/world/:worldId/event/:eventId/statement/revoke', async (ctx) => {
	useApiEndpoint({
		name: 'revokeWorldStatement',
		description: 'Marks the specified event as the revoker for this world statement.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const { statementId } = useRequestBody(ctx, {
		statementId: RequiredParam(StringValidator),
	})

	return await WorldService.revokeWorldStatement({
		eventId,
		statementId,
	})
})

export const WorldRouter = router