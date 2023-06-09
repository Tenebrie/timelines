import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { ActorService } from '@src/services/ActorService'
import { RedisService } from '@src/services/RedisService'
import { WorldService } from '@src/services/WorldService'
import {
	BadRequestError,
	BigIntValidator,
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
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator'
import { StringArrayValidator } from './validators/StringArrayValidator'
import { WorldCalendarTypeValidator } from './validators/WorldCalendarTypeValidator'
import { WorldEventTypeValidator } from './validators/WorldEventTypeValidator'

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
		name: RequiredParam(StringValidator),
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

	await WorldService.checkUserWriteAccess(user, worldId)

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

	await WorldService.checkUserReadAccess(user, worldId)

	return await WorldService.findWorldDetails(worldId)
})

/**
 * World events
 */
router.post('/api/world/:worldId/event', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEvent',
		description: 'Creates a new world event.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		type: RequiredParam(WorldEventTypeValidator),
		timestamp: RequiredParam(BigIntValidator),
	})

	const { event, world } = await WorldService.createWorldEvent(worldId, params)

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return event
})

router.patch('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEvent',
		description: 'Updates the target world event',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		icon: OptionalParam(NameStringValidator),
		timestamp: OptionalParam(BigIntValidator),
		description: OptionalParam(StringValidator),
	})

	const { event, world } = await WorldService.updateWorldEvent({ worldId, eventId, params })

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return event
})

router.delete('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEvent',
		description: 'Deletes the target world event.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const { event, world } = await WorldService.deleteWorldEvent({ worldId, eventId })

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return event
})

/**
 * World statements
 */
router.post('/api/world/:worldId/statement', async (ctx) => {
	useApiEndpoint({
		name: 'issueWorldStatement',
		description: 'Creates a new world statement and marks the specified event as the issuer.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		eventId: RequiredParam(StringValidator),
		content: RequiredParam(StringValidator),
		title: OptionalParam(NameStringValidator),
	})

	const { statement, world } = await WorldService.issueWorldStatement({
		...params,
		worldId,
		relatedActors: [],
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

router.patch('/api/world/:worldId/statement/:statementId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldStatement',
		description: 'Updates the target world statement',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		relatedActorIds: OptionalParam(StringArrayValidator),
		content: OptionalParam(StringValidator),
		title: OptionalParam(OptionalNameStringValidator),
	})

	const relatedActors = params.relatedActorIds
		? await ActorService.findActorsByIds(params.relatedActorIds)
		: []
	if (params.relatedActorIds && relatedActors.length < params.relatedActorIds.length) {
		throw new BadRequestError('Invalid actor IDs')
	}

	const { event, world } = await WorldService.updateWorldStatement({
		worldId,
		statementId,
		params: {
			title: params.title,
			content: params.content,
			relatedActors,
		},
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return event
})

router.delete('/api/world/:worldId/statement/:statementId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldStatement',
		description: 'Deletes the target world statement',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const { statement, world } = await WorldService.deleteWorldStatement({ worldId, statementId })

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

router.post('/api/world/:worldId/statement/:statementId/revoke', async (ctx) => {
	useApiEndpoint({
		name: 'revokeWorldStatement',
		description: 'Marks the specified event as the revoker for this world statement.',
		tags: [worldDetailsTag],
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

	const { statement, world } = await WorldService.revokeWorldStatement({
		worldId,
		eventId,
		statementId,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

router.post('/api/world/:worldId/statement/:statementId/unrevoke', async (ctx) => {
	useApiEndpoint({
		name: 'unrevokeWorldStatement',
		description: 'Marks the statement as never revoked.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, statementId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		statementId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)

	const { statement, world } = await WorldService.unrevokeWorldStatement({
		worldId,
		statementId,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

export const WorldRouter = router
