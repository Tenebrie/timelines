import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { WorldColorService } from '@src/services/WorldColorService.js'
import {
	NonEmptyStringValidator,
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

const worldColorTag = 'WorldColor'

const router = new Router().with(SessionMiddleware)

router.get('/api/worlds/:worldId/colors', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldColors',
		description: 'Lists all saved colors for a world.',
		tags: [worldColorTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(NonEmptyStringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(user, worldId)

	return await WorldColorService.listColors({ worldId })
})

router.post('/api/worlds/:worldId/colors', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldColor',
		description: 'Creates a new saved color for a world.',
		tags: [worldColorTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(NonEmptyStringValidator),
	})

	const { value, label } = useRequestBody(ctx, {
		value: RequiredParam(NonEmptyStringValidator),
		label: OptionalParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	return await WorldColorService.createColor({ worldId, value, label })
})

router.delete('/api/worlds/:worldId/colors/:colorId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldColor',
		description: 'Deletes a saved color from a world.',
		tags: [worldColorTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const { worldId, colorId } = usePathParams(ctx, {
		worldId: PathParam(NonEmptyStringValidator),
		colorId: PathParam(NonEmptyStringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	await WorldColorService.deleteColor({ colorId })
})

export const WorldColorRouter = router
