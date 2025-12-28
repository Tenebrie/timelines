import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { getAverageColor } from 'fast-average-color-node'
import * as fs from 'fs'
import {
	PathParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useOptionalAuth,
	usePathParams,
	useReturnValue,
} from 'moonflower'
import * as path from 'path'

import { worldThumbnailTag } from './utils/tags.js'

const router = new Router()

router.get('/api/world/:worldId/thumbnail', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldThumbnail',
		description: 'Returns an image representing the world thumbnail.',
		tags: [worldThumbnailTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)
	await AuthorizationService.checkUserReadAccessById(user, worldId)

	const file = await new Promise<Buffer>((resolve) => {
		resolve(
			fs.readFileSync(path.resolve(import.meta.dirname, '../assets/images/world-thumbnail-default.webp')),
		)
	})
	return useReturnValue(file, 200, 'image/webp')
})

router.get('/api/world/:worldId/thumbnail/metadata', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldThumbnailMetadata',
		description: 'Returns calculated world thumbnail parameters.',
		tags: [worldThumbnailTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	const user = await useOptionalAuth(ctx, UserAuthenticator)
	await AuthorizationService.checkUserReadAccessById(user, worldId)

	const file = await new Promise<Buffer>((resolve) => {
		resolve(
			fs.readFileSync(path.resolve(import.meta.dirname, '../assets/images/world-thumbnail-default.webp')),
		)
	})
	const averageColor = await getAverageColor(file)
	if (averageColor.error) {
		throw new Error(averageColor.error.message)
	}
	return {
		color: {
			...averageColor,
			error: undefined,
		},
	}
})

export const WorldThumbnailRouter = router
