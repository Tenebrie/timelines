import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { RedisService } from '@src/services/RedisService'
import { ValidationService } from '@src/services/ValidationService'
import { WorldEventDeltaService } from '@src/services/WorldEventDeltaService'
import { WorldEventService } from '@src/services/WorldEventService'
import { WorldService } from '@src/services/WorldService'
import {
	BigIntValidator,
	BooleanValidator,
	NonEmptyStringValidator,
	NullableBigIntValidator,
	NullableBooleanValidator,
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
import { ActualNullableBooleanValidator } from './validators/ActualNullableBooleanValidator'
import { ContentStringValidator } from './validators/ContentStringValidator'
import { NameStringValidator } from './validators/NameStringValidator'
import { NullableContentStringValidator } from './validators/NullableContentStringValidator'
import { NullableNameStringValidator } from './validators/NullableNameStringValidator'
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

	await AuthorizationService.checkUserWriteAccess(user, worldId)

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

	await AuthorizationService.checkUserWriteAccess(user, worldId)

	const params = useRequestBody(ctx, {
		type: RequiredParam(WorldEventTypeValidator),
		modules: RequiredParam(WorldEventFieldValidator),
		name: RequiredParam(NameStringValidator),
		icon: RequiredParam(NameStringValidator),
		description: RequiredParam(ContentStringValidator),
		timestamp: RequiredParam(BigIntValidator),
		revokedAt: RequiredParam(NullableBigIntValidator),
		targetActorIds: RequiredParam(StringArrayValidator),
		mentionedActorIds: RequiredParam(StringArrayValidator),
		customNameEnabled: RequiredParam(BooleanValidator),
	})

	const targetActors = (await parseActorList(params.targetActorIds)) ?? []
	const mentionedActors = (await parseActorList(params.mentionedActorIds)) ?? []

	const { event, world } = await WorldEventService.createWorldEvent({
		worldId,
		eventData: {
			...params,
			extraFields: params.modules,
			targetActors,
			mentionedActors,
		},
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

	const params = useRequestBody(ctx, {
		modules: OptionalParam(WorldEventFieldValidator),
		name: OptionalParam(OptionalNameStringValidator),
		icon: OptionalParam(OptionalNameStringValidator),
		timestamp: OptionalParam(BigIntValidator),
		revokedAt: OptionalParam(NullableBigIntValidator),
		description: OptionalParam(ContentStringValidator),
		targetActorIds: OptionalParam(StringArrayValidator),
		mentionedActorIds: OptionalParam(StringArrayValidator),
		customNameEnabled: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkIfEventIsRevokableAt(eventId, params.revokedAt)

	const targetActors = await parseActorList(params.targetActorIds)
	const mentionedActors = await parseActorList(params.mentionedActorIds)

	const { event, world } = await WorldEventService.updateWorldEvent({
		worldId,
		eventId,
		params: {
			extraFields: params.modules,
			name: params.name,
			icon: params.icon,
			timestamp: params.timestamp,
			revokedAt: params.revokedAt,
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

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const { event, world } = await WorldEventService.deleteWorldEvent({ worldId, eventId })

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

	const { revokedAt } = useRequestBody(ctx, {
		revokedAt: RequiredParam(BigIntValidator),
	})

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkIfEventIsRevokableAt(eventId, revokedAt)

	const { statement, world } = await WorldEventService.revokeWorldEvent({
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

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const { statement, world } = await WorldEventService.unrevokeWorldEvent({
		worldId,
		eventId,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return statement
})

/**
 * World event delta
 */
router.post('/api/world/:worldId/event/:eventId/delta', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEventDelta',
		description: 'Creates a new delta state for given event.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	const params = useRequestBody(ctx, {
		timestamp: RequiredParam(BigIntValidator),
		name: RequiredParam(NullableNameStringValidator),
		description: RequiredParam(NullableContentStringValidator),
		customName: RequiredParam(ActualNullableBooleanValidator),
	})

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkIfEventDeltaStateIsCreatableAt(eventId, params.timestamp)

	const { deltaState, world } = await WorldEventDeltaService.createEventDeltaState({
		worldId,
		eventId,
		data: params,
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return deltaState
})

router.patch('/api/world/:worldId/event/:eventId/delta/:deltaId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEventDelta',
		description: 'Updates the target world event delta state',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId, deltaId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
		deltaId: PathParam(StringValidator),
	})

	const params = useRequestBody(ctx, {
		timestamp: OptionalParam(BigIntValidator),
		name: OptionalParam(OptionalNameStringValidator),
		description: OptionalParam(ContentStringValidator),
		customName: OptionalParam(BooleanValidator),
	})

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkEventDeltaStateValidity(deltaId)

	const { deltaState, world } = await WorldEventDeltaService.updateEventDeltaState({
		worldId,
		deltaId,
		params: {
			timestamp: params.timestamp,
			name: params.name,
			description: params.description,
			customName: params.customName,
		},
	})

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return deltaState
})

router.delete('/api/world/:worldId/event/:eventId/delta/:deltaId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEventDelta',
		description: 'Deletes the target world event delta state.',
		tags: [worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId, deltaId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
		deltaId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccess(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkEventDeltaStateValidity(deltaId)

	const { deltaState, world } = await WorldEventDeltaService.deleteEventDeltaState({ worldId, deltaId })

	RedisService.notifyAboutWorldUpdate({ user, worldId, timestamp: world.updatedAt })

	return deltaState
})

export const WorldRouter = router
