import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AssetService } from '@src/services/AssetService.js'
import { CloudStorageService } from '@src/services/CloudStorageService.js'
import {
	NonEmptyStringValidator,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useRequestBody,
} from 'moonflower'

import { UserService } from '../services/UserService.js'
import { profileTag } from './utils/tags.js'

const router = new Router().with(SessionMiddleware)

router.get('/api/profile/storage', async (ctx) => {
	useApiEndpoint({
		name: 'getStorageStatus',
		summary: 'Get storage status',
		description: 'Get storage status for the current user',
		tags: [profileTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const quota = await CloudStorageService.getUserRemainingQuota(user)
	return { quota }
})

router.patch('/api/profile', async (ctx) => {
	useApiEndpoint({
		name: 'updateProfile',
		summary: 'Profile update endpoint',
		description: 'Updates the current user profile',
		tags: [profileTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const body = useRequestBody(ctx, {
		username: NonEmptyStringValidator,
		bio: StringValidator,
	})

	await UserService.updateUser(user.id, body)

	return {
		user,
	}
})

router.post('/api/profile/avatar', async (ctx) => {
	useApiEndpoint({
		name: 'postAvatar',
		summary: 'Avatar endpoint',
		description: 'Sets the avatar for the current user',
		tags: [profileTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { assetId } = useRequestBody(ctx, {
		assetId: RequiredParam(StringValidator),
	})

	const asset = await AssetService.setUserAvatar(user.id, assetId)

	return {
		avatar: asset,
	}
})

export const ProfileRouter = router
