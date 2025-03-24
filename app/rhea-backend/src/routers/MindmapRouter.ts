import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware'
import { ActorService } from '@src/services/ActorService'
import { AuthorizationService } from '@src/services/AuthorizationService'
import { MindmapService } from '@src/services/MindmapService'
import { RedisService } from '@src/services/RedisService'
import {
	BadRequestError,
	NumberValidator,
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

import { mindmapTag } from './utils/tags'

const router = new Router().with(SessionMiddleware)

router.get('/api/world/:worldId/mindmap', async (ctx) => {
	useApiEndpoint({
		name: 'getMindmap',
		description: 'Gets the mindmap for the target world',
		tags: [mindmapTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserReadAccessById(user, worldId)

	return {
		nodes: await MindmapService.getNodes(worldId),
	}
})

router.post('/api/world/:worldId/mindmap/node', async (ctx) => {
	useApiEndpoint({
		name: 'createNode',
		description: 'Creates a new node',
		tags: [mindmapTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		positionX: RequiredParam(NumberValidator),
		positionY: RequiredParam(NumberValidator),
		parentActorId: OptionalParam(StringValidator),
	})

	const parentActor = await ActorService.findActor({ worldId, actorId: params.parentActorId })
	if (!parentActor) {
		throw new BadRequestError('Parent actor not found')
	}
	if (parentActor.node) {
		throw new BadRequestError('Parent actor already has a node')
	}

	const node = await MindmapService.createNode({ worldId, ...params })
	RedisService.notifyAboutMindmapNodeUpdate(ctx, { worldId, node })

	return node
})

router.patch('/api/world/:worldId/mindmap/node/:nodeId', async (ctx) => {
	useApiEndpoint({
		name: 'updateNode',
		description: 'Updates the target node',
		tags: [mindmapTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, nodeId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		nodeId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const params = useRequestBody(ctx, {
		positionX: OptionalParam(NumberValidator),
		positionY: OptionalParam(NumberValidator),
	})

	const node = await MindmapService.updateNode(nodeId, params)
	RedisService.notifyAboutMindmapNodeUpdate(ctx, { worldId, node })

	return node
})

router.delete('/api/world/:worldId/mindmap/node/:nodeId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteNode',
		description: 'Deletes the target node',
		tags: [mindmapTag],
	})

	const user = await useAuth(ctx, UserAuthenticator)

	const { worldId, nodeId } = usePathParams(ctx, {
		worldId: PathParam(StringValidator),
		nodeId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserWriteAccessById(user, worldId)

	const node = await MindmapService.deleteNode(nodeId)

	RedisService.notifyAboutMindmapNodeUpdate(ctx, { worldId, node })

	return node
})

export const MindmapRouter = router
