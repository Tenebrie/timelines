import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { RedisService } from '@src/services/RedisService'
import { WorldService } from '@src/services/WorldService'
import {
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

import { NameStringValidator } from './validators/NameStringValidator'
import { WorldEventTypeValidator } from './validators/WorldEventTypeValidator'

const router = new Router()

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

	RedisService.notifyAboutWorldUpdate(user, worldId)
})

/**
 * World events
 */
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
		name: RequiredParam(NameStringValidator),
		type: RequiredParam(WorldEventTypeValidator),
		timestamp: RequiredParam(NumberValidator),
	})

	const event = await WorldService.createWorldEvent(worldId, params)

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return event
})

router.patch('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEvent',
		description: 'Updates the target world event',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		timestamp: OptionalParam(NumberValidator),
		description: OptionalParam(StringValidator),
	})

	const event = await WorldService.updateWorldEvent(eventId, params)

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return event
})

router.delete('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEvent',
		description: 'Deletes the target world event.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const event = await WorldService.deleteWorldEvent(eventId)

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return event
})

/**
 * World statements
 */
router.post('/api/world/:worldId/statement', async (ctx) => {
	useApiEndpoint({
		name: 'issueWorldStatement',
		description: 'Creates a new world statement and marks the specified event as the issuer.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		eventId: RequiredParam(StringValidator),
		title: RequiredParam(NameStringValidator),
		content: OptionalParam(StringValidator),
	})

	const statement = await WorldService.issueWorldStatement(params)

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return statement
})

router.delete('/api/world/:worldId/statement/:statementId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldStatement',
		description: 'Deletes the target world statement',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const statement = await WorldService.deleteWorldStatement(statementId)

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return statement
})

router.post('/api/world/:worldId/statement/:statementId/revoke', async (ctx) => {
	useApiEndpoint({
		name: 'revokeWorldStatement',
		description: 'Marks the specified event as the revoker for this world statement.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const { eventId } = useRequestBody(ctx, {
		eventId: RequiredParam(StringValidator),
	})

	const statement = await WorldService.revokeWorldStatement({
		eventId,
		statementId,
	})

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return statement
})

router.post('/api/world/:worldId/statement/:statementId/unrevoke', async (ctx) => {
	useApiEndpoint({
		name: 'unrevokeWorldStatement',
		description: 'Marks the statement as never revoked.',
		tags: [worldTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const statement = await WorldService.unrevokeWorldStatement({
		statementId,
	})

	RedisService.notifyAboutWorldUpdate(user, worldId)

	return statement
})

export const WorldRouter = router
