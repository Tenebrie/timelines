import { ServiceAuthenticator } from '@src/middleware/auth/ServiceAuthenticator.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { WorldService } from '@src/services/WorldService.js'
import {
	NonEmptyStringValidator,
	RequiredParam,
	Router,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useQueryParams,
} from 'moonflower'

import { UserService } from '../../services/UserService.js'

const router = new Router().with(async (ctx) => {
	return await useAuth(ctx, ServiceAuthenticator)
})

router.get('/api/internal/auth/:userId', async (ctx) => {
	useApiEndpoint({
		name: 'getUserWorldAccessLevel',
		description: "Returns the user's access level for a specific world.",
	})

	const { userId } = usePathParams(ctx, {
		userId: NonEmptyStringValidator,
	})

	const { worldId } = useQueryParams(ctx, {
		worldId: RequiredParam(NonEmptyStringValidator),
	})

	const user = await UserService.findByIdInternal(userId)
	const world = await WorldService.findWorldBrief(worldId)
	if (!user || !world) {
		return {
			owner: false,
			write: false,
			read: false,
		}
	}

	return await AuthorizationService.getUserAccessLevel(user, world)
})

export const ClientAuthRouter = router
