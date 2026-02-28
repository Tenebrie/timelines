import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { WorldShareService } from '@src/services/WorldShareService.js'
import {
	OptionalParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { worldShareLinkTag } from './utils/tags.js'
import { CollaboratorAccessValidator } from './validators/CollaboratorAccessValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	return {
		user: await useAuth(ctx, UserAuthenticator),
	}
})

router.get('/api/world/:worldId/share-links', async (ctx) => {
	useApiEndpoint({
		name: 'listWorldShareLinks',
		description: 'Lists all share links for a world.',
		tags: [worldShareLinkTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(ctx.user, worldId)

	return await WorldShareService.listShareLinks(worldId)
})

router.post('/api/world/:worldId/share-link/generate', async (ctx) => {
	useApiEndpoint({
		name: 'generateFreeWorldShareLink',
		description: 'Generates a random free share link.',
		tags: [],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: RequiredParam(StringValidator),
	})

	const { preferredSlug } = useRequestBody(ctx, {
		preferredSlug: OptionalParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(ctx.user, worldId)

	return await WorldShareService.generateRandomSlug({ preferredSlug })
})

router.post('/api/world/:worldId/share-link', async (ctx) => {
	useApiEndpoint({
		name: 'createWorldShareLink',
		description: 'Creates a new share link for a world.',
		tags: [worldShareLinkTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: RequiredParam(StringValidator),
	})

	const { slug, label, expiresAt, accessMode } = useRequestBody(ctx, {
		slug: RequiredParam(StringValidator),
		label: RequiredParam(StringValidator),
		expiresAt: OptionalParam(StringValidator),
		accessMode: RequiredParam(CollaboratorAccessValidator),
	})

	await AuthorizationService.checkUserWorldOwner(ctx.user, worldId)

	return await WorldShareService.createShareLink({
		worldId,
		body: {
			slug,
			label,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			accessMode,
		},
	})
})

router.post('/api/world/:worldId/share-link/:shareLinkId/expire', async (ctx) => {
	useApiEndpoint({
		name: 'expireWorldShareLink',
		description: 'Immediately expires a share link for a world.',
		tags: [worldShareLinkTag],
	})

	const { worldId, shareLinkId } = usePathParams(ctx, {
		worldId: RequiredParam(StringValidator),
		shareLinkId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(ctx.user, worldId)

	await WorldShareService.revokeShareLink(shareLinkId)
})

router.delete('/api/world/:worldId/share-link/:shareLinkId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteWorldShareLink',
		description: 'Deletes a share link for a world.',
		tags: [worldShareLinkTag],
	})

	const { worldId, shareLinkId } = usePathParams(ctx, {
		worldId: RequiredParam(StringValidator),
		shareLinkId: RequiredParam(StringValidator),
	})

	await AuthorizationService.checkUserWorldOwner(ctx.user, worldId)

	await WorldShareService.deleteShareLink(shareLinkId)
})

export const WorldShareRouter = router
