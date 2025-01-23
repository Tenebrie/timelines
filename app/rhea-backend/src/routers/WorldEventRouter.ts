import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { RedisService } from '@src/services/RedisService'
import { ValidationService } from '@src/services/ValidationService'
import { WorldEventDeltaService } from '@src/services/WorldEventDeltaService'
import { WorldEventService } from '@src/services/WorldEventService'
import {
	BigIntValidator,
	BooleanValidator,
	NullableBigIntValidator,
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
import { NullableNameStringValidator } from './validators/NullableNameStringValidator'
import { NullableUuidStringValidator } from './validators/NullableUuidStringValidator'
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator'
import { OptionalURLStringValidator } from './validators/OptionalURLStringValidator'
import { UuidStringValidator } from './validators/UuidStringValidator'
import { WorldEventFieldValidator } from './validators/WorldEventFieldValidator'
import { WorldEventTypeValidator } from './validators/WorldEventTypeValidator'

const router = new Router()

export const worldEventTag = 'worldEvent'
export const worldEventDeltaTag = 'worldEventDelta'
export const worldListTag = 'worldList'
export const worldDetailsTag = 'worldDetails'

/**
 * World events
 */
router.post('/api/world/:worldId/event', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEvent',
		description: 'Creates a new world event.',
		tags: [worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		type: RequiredParam(WorldEventTypeValidator),
		name: RequiredParam(NameStringValidator),
		modules: OptionalParam(WorldEventFieldValidator),
		icon: OptionalParam(NameStringValidator),
		description: OptionalParam(ContentStringValidator),
		descriptionRich: OptionalParam(ContentStringValidator),
		timestamp: RequiredParam(BigIntValidator),
		revokedAt: OptionalParam(NullableBigIntValidator),
		customNameEnabled: OptionalParam(BooleanValidator),
		externalLink: OptionalParam(ContentStringValidator),
		worldEventTrackId: OptionalParam(UuidStringValidator),
		mentions: OptionalParam(MentionsArrayValidator),
	})

	const { event, world } = await WorldEventService.createWorldEvent({
		worldId,
		eventData: {
			...params,
			extraFields: params.modules,
			worldEventTrackId: params.worldEventTrackId ?? null,
		},
	})

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return event
})

router.patch('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEvent',
		description: 'Updates the target world event',
		tags: [worldEventTag],
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
		descriptionRich: OptionalParam(ContentStringValidator),
		mentions: OptionalParam(MentionsArrayValidator),
		customNameEnabled: OptionalParam(BooleanValidator),
		externalLink: OptionalParam(OptionalURLStringValidator),
		worldEventTrackId: OptionalParam(NullableUuidStringValidator),
	})

	const mappedParams = {
		extraFields: params.modules,
		name: params.name,
		icon: params.icon,
		timestamp: params.timestamp,
		revokedAt: params.revokedAt,
		description: params.description,
		descriptionRich: params.descriptionRich,
		customName: params.customNameEnabled,
		externalLink: params.externalLink,
		worldEventTrackId: params.worldEventTrackId,
		mentions: params.mentions,
	}

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventPatchValidity(eventId, mappedParams)

	const { event } = await WorldEventService.updateWorldEvent({
		worldId,
		eventId,
		params: mappedParams,
	})

	RedisService.notifyAboutWorldEventUpdate({ worldId, event })

	return event
})

router.delete('/api/world/:worldId/event/:eventId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEvent',
		description: 'Deletes the target world event.',
		tags: [worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const { event, world } = await WorldEventService.deleteWorldEvent({ worldId, eventId })

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return event
})

router.post('/api/world/:worldId/event/:eventId/revoke', async (ctx) => {
	useApiEndpoint({
		name: 'revokeWorldEvent',
		description: 'Marks the specified event as revoked at specified timestamp.',
		tags: [worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	const { revokedAt } = useRequestBody(ctx, {
		revokedAt: RequiredParam(BigIntValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkIfEventIsRevokableAt(eventId, revokedAt)

	const { statement, world } = await WorldEventService.revokeWorldEvent({
		worldId,
		eventId,
		revokedAt,
	})

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return statement
})

router.post('/api/world/:worldId/event/:eventId/unrevoke', async (ctx) => {
	useApiEndpoint({
		name: 'unrevokeWorldEvent',
		description: 'Marks the event as never revoked.',
		tags: [worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventValidity(eventId)

	const { statement, world } = await WorldEventService.unrevokeWorldEvent({
		worldId,
		eventId,
	})

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return statement
})

/**
 * World event delta
 */
router.post('/api/world/:worldId/event/:eventId/delta', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEventDelta',
		description: 'Creates a new delta state for given event.',
		tags: [worldEventDeltaTag, worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
	})

	const params = useRequestBody(ctx, {
		timestamp: RequiredParam(BigIntValidator),
		name: RequiredParam(NullableNameStringValidator),
		description: RequiredParam(NullableNameStringValidator),
		descriptionRich: RequiredParam(NullableNameStringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkIfEventDeltaStateIsCreatableAt(eventId, params.timestamp)

	const { deltaState, world } = await WorldEventDeltaService.createEventDeltaState({
		worldId,
		eventId,
		data: params,
	})

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return deltaState
})

router.patch('/api/world/:worldId/event/:eventId/delta/:deltaId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEventDelta',
		description: 'Updates the target world event delta state',
		tags: [worldEventDeltaTag, worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId, deltaId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
		deltaId: PathParam(StringValidator),
	})

	const params = useRequestBody(ctx, {
		timestamp: OptionalParam(BigIntValidator),
		name: OptionalParam(NullableNameStringValidator),
		description: OptionalParam(NullableNameStringValidator),
		descriptionRich: OptionalParam(NullableNameStringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkEventDeltaStateValidity(deltaId)
	if (params.timestamp !== undefined) {
		await ValidationService.checkIfEventDeltaStateIsCreatableAt(eventId, params.timestamp, [deltaId])
	}

	const { deltaState } = await WorldEventDeltaService.updateEventDeltaState({
		worldId,
		deltaId,
		params: {
			timestamp: params.timestamp,
			name: params.name,
			description: params.description,
			descriptionRich: params.descriptionRich,
		},
	})

	RedisService.notifyAboutWorldEventDeltaUpdate({ worldId, delta: deltaState })

	return deltaState
})

router.delete('/api/world/:worldId/event/:eventId/delta/:deltaId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEventDelta',
		description: 'Deletes the target world event delta state.',
		tags: [worldEventDeltaTag, worldEventTag, worldDetailsTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, eventId, deltaId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		eventId: PathParam(StringValidator),
		deltaId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)
	await ValidationService.checkEventValidity(eventId)
	await ValidationService.checkEventDeltaStateValidity(deltaId)

	const { deltaState, world } = await WorldEventDeltaService.deleteEventDeltaState({ worldId, deltaId })

	RedisService.notifyAboutWorldUpdate({ worldId, timestamp: world.updatedAt })

	return deltaState
})

export const WorldEventRouter = router
