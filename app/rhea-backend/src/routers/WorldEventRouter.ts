import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { EntityNameService } from '@src/services/EntityNameService'
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

import { worldDetailsTag, worldEventDeltaTag, worldEventTag } from './utils/tags'
import { ContentStringValidator } from './validators/ContentStringValidator'
import { MentionsArrayValidator } from './validators/MentionsArrayValidator'
import { NullableEventTrackValidator } from './validators/NullableEventTrackValidator'
import { NullableNameStringValidator } from './validators/NullableNameStringValidator'
import { OptionalNameStringValidator } from './validators/OptionalNameStringValidator'
import { OptionalURLStringValidator } from './validators/OptionalURLStringValidator'
import { UuidStringValidator } from './validators/UuidStringValidator'
import { WorldEventFieldValidator } from './validators/WorldEventFieldValidator'

const router = new Router().with(SessionMiddleware)

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
		id: OptionalParam(UuidStringValidator),
		name: OptionalParam(OptionalNameStringValidator),
		icon: OptionalParam(OptionalNameStringValidator),
		color: OptionalParam(OptionalNameStringValidator),
		description: RequiredParam(ContentStringValidator),
		descriptionRich: OptionalParam(ContentStringValidator),
		timestamp: RequiredParam(BigIntValidator),
		revokedAt: OptionalParam(NullableBigIntValidator),
		customName: OptionalParam(BooleanValidator),
		externalLink: OptionalParam(ContentStringValidator),
		worldEventTrackId: OptionalParam(NullableEventTrackValidator),
		mentions: OptionalParam(MentionsArrayValidator),
	})

	params.name = EntityNameService.getEventCreateName(params)

	const { event, world } = await WorldEventService.createWorldEvent({
		worldId,
		createData: {
			id: params.id,
			name: params.name,
			type: 'SCENE',
			timestamp: params.timestamp,
		},
		updateData: params,
	})

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

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
		color: OptionalParam(OptionalNameStringValidator),
		timestamp: OptionalParam(BigIntValidator),
		revokedAt: OptionalParam(NullableBigIntValidator),
		description: OptionalParam(ContentStringValidator),
		descriptionRich: OptionalParam(ContentStringValidator),
		mentions: OptionalParam(MentionsArrayValidator),
		customNameEnabled: OptionalParam(BooleanValidator),
		externalLink: OptionalParam(OptionalURLStringValidator),
		worldEventTrackId: OptionalParam(NullableEventTrackValidator),
	})

	const mappedParams = {
		extraFields: params.modules,
		name: EntityNameService.getEventUpdateName(params),
		icon: params.icon,
		color: params.color,
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

	RedisService.notifyAboutWorldEventUpdate(ctx, { worldId, event })

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

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

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

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

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

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

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

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

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

	RedisService.notifyAboutWorldEventDeltaUpdate(ctx, { worldId, delta: deltaState })

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

	RedisService.notifyAboutWorldUpdate(ctx, { worldId, timestamp: world.updatedAt })

	return deltaState
})

export const WorldEventRouter = router
