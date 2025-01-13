import { UserAuthenticator } from '@src/auth/UserAuthenticator'
import { getAverageColor } from 'fast-average-color-node'
import * as fs from 'fs'
import {
	PathParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useReturnValue,
} from 'moonflower'
import * as path from 'path'

const router = new Router()

export const worldThumbnailTag = 'worldThumbnail'

router.get('/api/world/:worldId/thumbnail', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldThumbnail',
		description: 'Returns an image representing the world thumbnail.',
		tags: [worldThumbnailTag],
	})

	usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await useAuth(ctx, UserAuthenticator)

	const file = await new Promise<Buffer>((resolve) => {
		resolve(fs.readFileSync(path.resolve(__dirname, '../assets/images/world-thumbnail-default.webp')))
	})
	return useReturnValue(file, 200, 'image/webp')
})

router.get('/api/world/:worldId/thumbnail/metadata', async (ctx) => {
	useApiEndpoint({
		name: 'getWorldThumbnailMetadata',
		description: 'Returns calculated world thumbnail parameters.',
		tags: [worldThumbnailTag],
	})

	usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await useAuth(ctx, UserAuthenticator)

	const file = await new Promise<Buffer>((resolve) => {
		resolve(fs.readFileSync(path.resolve(__dirname, '../assets/images/world-thumbnail-default.webp')))
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
