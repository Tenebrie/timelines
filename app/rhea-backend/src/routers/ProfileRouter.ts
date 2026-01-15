import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AssetService } from '@src/services/AssetService.js'
import { CloudStorageService } from '@src/services/CloudStorageService.js'
import { IconsService } from '@src/services/IconsService.js'
import {
	BadRequestError,
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

router.get('/api/profile/icons/favorites', async (ctx) => {
	useApiEndpoint({
		name: 'getFavoriteIcons',
		summary: 'Get favorite icons',
		description: 'Get a list of favorite icons for the current user',
		tags: [profileTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)
	const favorites = await IconsService.getCommonWorldEventIcons(user.id)
	return { favorites }
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

router.post('/api/profile/password', async (ctx) => {
	useApiEndpoint({
		name: 'changePassword',
		summary: 'Change password endpoint',
		description: 'Changes the password for the current user',
		tags: [profileTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { currentPassword, newPassword } = useRequestBody(ctx, {
		currentPassword: NonEmptyStringValidator,
		newPassword: NonEmptyStringValidator,
	})

	const success = await UserService.changePassword(user.id, currentPassword, newPassword)
	if (!success) {
		throw new BadRequestError('Current password is incorrect')
	}

	return {
		success: true,
	}
})

export const ProfileRouter = router
