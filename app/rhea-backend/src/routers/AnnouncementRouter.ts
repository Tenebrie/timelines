import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { AnnouncementService } from '@src/services/AnnouncementService'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { PathParam, Router, StringValidator, useApiEndpoint, useAuth, usePathParams } from 'moonflower'

import { announcementListTag } from './utils/tags'

const router = new Router()

router.get('/api/announcements', async (ctx) => {
	useApiEndpoint({
		name: 'getAnnouncements',
		description: "Lists logged in user's announcements.",
		tags: [announcementListTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	return await AnnouncementService.listAnnouncements({ user })
})

router.delete('/api/announcements/:id', async (ctx) => {
	useApiEndpoint({
		name: 'dismissAnnouncement',
		description: 'Permanently hides the target announcement.',
		tags: [announcementListTag],
	})

	const { id } = usePathParams(ctx, {
		id: PathParam(StringValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)

	await AuthorizationService.checkUserAnnouncementAccess(user, id)

	await AnnouncementService.dismiss({ id })
})

export const AnnouncementRouter = router
