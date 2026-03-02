import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { WorldShareService } from '@src/services/WorldShareService.js'
import {
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	useOptionalAuth,
	usePathParams,
} from 'moonflower'

const router = new Router().with(SessionMiddleware)

router.get('/api/share-link-visit/:slug', async (ctx) => {
	useApiEndpoint({
		name: 'visitWorldShareLink',
		description: 'Provides information to add the user to collaborators via a share link.',
		tags: [],
	})

	const { slug } = usePathParams(ctx, {
		slug: RequiredParam(StringValidator),
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)

	return await WorldShareService.validateLinkBySlug(slug, user)
})

router.post('/api/share-link-visit/:slug/accept', async (ctx) => {
	useApiEndpoint({
		name: 'acceptWorldShareLink',
		description: 'Accepts a world share link and adds the user as a collaborator.',
		tags: [],
	})

	const { slug } = usePathParams(ctx, {
		slug: RequiredParam(StringValidator),
	})

	const user = await useAuth(ctx, UserAuthenticator)

	return await WorldShareService.acceptLinkBySlug({ slug, user })
})

export const WorldShareVisitRouter = router
