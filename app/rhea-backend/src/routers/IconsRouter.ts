import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { IconsService } from '@src/services/IconsService.js'
import { NonEmptyStringValidator, Router, useApiEndpoint, useAuth, usePathParams } from 'moonflower'

import { favoriteIconsTag } from './utils/tags.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	const user = await useAuth(ctx, UserAuthenticator)
	return {
		user,
	}
})

router.get('/api/icons/favorites', async (ctx) => {
	useApiEndpoint({
		name: 'getFavoriteIcons',
		summary: 'Get favorite icons',
		description: 'Get a list of favorite icons for the current user',
		tags: [favoriteIconsTag],
	})

	const iconSets = await IconsService.getUserFavoriteIconSets(ctx.user.id)
	return { iconSets }
})

router.post('/api/icons/favorites/:iconId', async (ctx) => {
	useApiEndpoint({
		name: 'addFavoriteIcon',
		summary: 'Add favorite icon',
		description: "Adds an icon to the user's list of favorite icons",
		tags: [favoriteIconsTag],
	})

	const { iconId } = usePathParams(ctx, {
		iconId: NonEmptyStringValidator,
	})

	await IconsService.addUserFavoriteIcon(ctx.user.id, iconId)
})

router.delete('/api/icons/favorites/:iconId', async (ctx) => {
	useApiEndpoint({
		name: 'removeFavoriteIcon',
		summary: 'Remove favorite icon',
		description: "Removes an icon from the user's list of favorite icons",
		tags: [favoriteIconsTag],
	})

	const { iconId } = usePathParams(ctx, {
		iconId: NonEmptyStringValidator,
	})

	await IconsService.removeUserFavoriteIcon(ctx.user.id, iconId)
})

export const IconsRouter = router
