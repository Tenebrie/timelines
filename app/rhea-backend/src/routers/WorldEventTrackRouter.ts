import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { RedisService } from '@src/services/RedisService'
import { WorldEventTrackService } from '@src/services/WorldEventTrackService'
import {
	BooleanValidator,
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

import { worldEventTracksTag } from './utils/tags'
import { NameStringValidator } from './validators/NameStringValidator'
import { NonNegativeIntegerValidator } from './validators/NonNegativeIntegerValidator'

const router = new Router().with(SessionMiddleware)

router.get('/api/world/:worldId/event-tracks', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldEventTracks',
		description: 'Lists all world event tracks.',
		tags: [worldEventTracksTag],
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(user, worldId)

	return await WorldEventTrackService.listEventTracks({ worldId })
})

router.post('/api/world/:worldId/event-track', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldEventTrack',
		description: 'Creates a new world event track.',
		tags: [worldEventTracksTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		position: OptionalParam(NonNegativeIntegerValidator),
		assignOrphans: RequiredParam(BooleanValidator),
	})

	const { eventTrack, world } = await WorldEventTrackService.createEventTrack({
		worldId,
		data: params,
	})

	if (params.assignOrphans) {
		await WorldEventTrackService.assignOrphansToTrack({
			worldId,
			trackId: eventTrack.id,
		})
	}

	RedisService.notifyAboutWorldTracksUpdate(ctx, { worldId, timestamp: world.updatedAt })

	return eventTrack
})

router.patch('/api/world/:worldId/event-track/:trackId', async (ctx) => {
	useApiEndpoint({
		name: 'updateWorldEventTrack',
		description: 'Updates the given world event track.',
		tags: [worldEventTracksTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, trackId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		trackId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		position: OptionalParam(NonNegativeIntegerValidator),
		visible: OptionalParam(BooleanValidator),
	})

	const { eventTrack, world } = await WorldEventTrackService.updateEventTrack({
		worldId,
		trackId,
		data: params,
	})

	RedisService.notifyAboutWorldTracksUpdate(ctx, { worldId, timestamp: world.updatedAt })

	return eventTrack
})

router.post('/api/world/:worldId/event-track/swap', async (ctx) => {
	useApiEndpoint({
		name: 'swapWorldEventTracks',
		description: 'Swaps the position of two given tracks.',
		tags: [worldEventTracksTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		trackA: RequiredParam(StringValidator),
		trackB: RequiredParam(StringValidator),
	})

	const { world } = await WorldEventTrackService.swapEventTracks({
		worldId,
		trackIdA: params.trackA,
		trackIdB: params.trackB,
	})

	RedisService.notifyAboutWorldTracksUpdate(ctx, { worldId, timestamp: world.updatedAt })
})

router.delete('/api/world/:worldId/event-track/:trackId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldEventTrack',
		description: 'Deletes the given world event track.',
		tags: [worldEventTracksTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, trackId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		trackId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const { world } = await WorldEventTrackService.deleteEventTrack({
		worldId,
		trackId,
	})

	RedisService.notifyAboutWorldTracksUpdate(ctx, { worldId, timestamp: world.updatedAt })
})

export const WorldEventTrackRouter = router
