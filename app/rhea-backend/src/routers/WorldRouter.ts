import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { RedisService } from '@src/services/RedisService'
import { WorldService } from '@src/services/WorldService'
import {
	BigIntValidator,
	BooleanValidator,
	NonEmptyStringValidator,
	NullableBigIntValidator,
	NullableStringValidator,
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

import { parseActorList } from './utils/parseActorList'
import { ContentStringValidator } from './validators/ContentStringValidator'
import { NameStringValidator } from './validators/NameStringValidator'
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator'
import { StringArrayValidator } from './validators/StringArrayValidator'
import { WorldCalendarTypeValidator } from './validators/WorldCalendarTypeValidator'
import { WorldEventFieldValidator } from './validators/WorldEventFieldValidator'
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
		type: RequiredParam(WorldEventTypeValidator),
		modules: RequiredParam(WorldEventFieldValidator),
		name: RequiredParam(NameStringValidator),
		icon: RequiredParam(NameStringValidator),
		description: RequiredParam(ContentStringValidator),
		replacedEventId: RequiredParam(NullableStringValidator),
		timestamp: RequiredParam(BigIntValidator),
		revokedAt: RequiredParam(NullableBigIntValidator),
		targetActorIds: RequiredParam(StringArrayValidator),
		mentionedActorIds: RequiredParam(StringArrayValidator),
		customNameEnabled: RequiredParam(BooleanValidator),
	})

	const targetActors = (await parseActorList(params.targetActorIds)) ?? []
	const mentionedActors = (await parseActorList(params.mentionedActorIds)) ?? []

	const { event, world } = await WorldService.createWorldEvent(worldId, {
		...params,
		extraFields: params.modules,
		targetActors,
		mentionedActors,
	})

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
	await WorldService.checkEventValidity(eventId)

	const params = useRequestBody(ctx, {
		modules: OptionalParam(WorldEventFieldValidator),
		name: OptionalParam(OptionalNameStringValidator),
		icon: OptionalParam(OptionalNameStringValidator),
		timestamp: OptionalParam(BigIntValidator),
		revokedAt: OptionalParam(NullableBigIntValidator),
		description: OptionalParam(ContentStringValidator),
		replacedEventId: OptionalParam(NullableStringValidator),
		targetActorIds: OptionalParam(StringArrayValidator),
		mentionedActorIds: OptionalParam(StringArrayValidator),
		customNameEnabled: OptionalParam(BooleanValidator),
	})

	const targetActors = await parseActorList(params.targetActorIds)
	const mentionedActors = await parseActorList(params.mentionedActorIds)

	const { event, world } = await WorldService.updateWorldEvent({
		worldId,
		eventId,
		params: {
			extraFields: params.modules,
			name: params.name,
			icon: params.icon,
			timestamp: params.timestamp,
			revokedAt: params.revokedAt,
			replacedEventId: params.replacedEventId,
			description: params.description,
			targetActors,
			mentionedActors,
			customName: params.customNameEnabled,
		},
	})

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
	await WorldService.checkEventValidity(eventId)

	const { event, world } = await WorldService.deleteWorldEvent({ worldId, eventId })

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return event
})

router.post('/api/world/:worldId/event/:eventId/revoke', async (ctx) => {
	useApiEndpoint({
		name: 'revokeWorldEvent',
		description: 'Marks the specified event as revoked at specified timestamp.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)
	await WorldService.checkEventValidity(eventId)

	const { revokedAt } = useRequestBody(ctx, {
		revokedAt: RequiredParam(BigIntValidator),
	})

	const { statement, world } = await WorldService.revokeWorldEvent({
		worldId,
		eventId,
		revokedAt,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

router.post('/api/world/:worldId/event/:eventId/unrevoke', async (ctx) => {
	useApiEndpoint({
		name: 'unrevokeWorldEvent',
		description: 'Marks the event as never revoked.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await WorldService.checkUserWriteAccess(user, worldId)
	await WorldService.checkEventValidity(eventId)

	const { statement, world } = await WorldService.unrevokeWorldEvent({
		worldId,
		eventId,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

export const WorldRouter = router
