import { MindmapLinkDirection } from '@prisma/client'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { UserAuthMiddleware } from '@src/middleware/UserAuthMiddleware.js'
import { ActorService } from '@src/services/ActorService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { MindmapService } from '@src/services/MindmapService.js'
import { RedisService } from '@src/services/RedisService.js'
import {
	BadRequestError,
	Router,
	useApiEndpoint,
	usePathParams,
	useQueryParams,
	useRequestBody,
} from 'moonflower'
import z from 'zod'

import { mindmapGroupTag, mindmapNodeTag, mindmapWireTag } from './utils/tags.js'

const router = new Router().with(SessionMiddleware).with(UserAuthMiddleware)

router.get('/api/world/:worldId/mindmap', async (ctx) => {
	useApiEndpoint({
		name: 'getMindmap',
		description: 'Gets the mindmap for the target world',
		tags: [mindmapGroupTag, mindmapNodeTag, mindmapWireTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	return {
		nodes: await MindmapService.getNodes(worldId),
		wires: await MindmapService.getLinks(worldId),
	}
})

router.post('/api/world/:worldId/mindmap/nodes', async (ctx) => {
	useApiEndpoint({
		name: 'createNode',
		description: 'Creates a new node',
		tags: [mindmapGroupTag, mindmapNodeTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		id: z.string().optional(),
		positionX: z.number(),
		positionY: z.number(),
		parentActorId: z.string().optional(),
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

router.patch('/api/world/:worldId/mindmap/nodes/:nodeId', async (ctx) => {
	useApiEndpoint({
		name: 'updateNode',
		description: 'Updates the target node',
		tags: [mindmapGroupTag, mindmapNodeTag],
	})

	const { worldId, nodeId } = usePathParams(ctx, {
		worldId: z.string(),
		nodeId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		positionX: z.number().optional(),
		positionY: z.number().optional(),
	})

	const node = await MindmapService.updateNode(nodeId, params)
	RedisService.notifyAboutMindmapNodeUpdate(ctx, { worldId, node })

	return node
})

router.delete('/api/world/:worldId/mindmap/nodes', async (ctx) => {
	useApiEndpoint({
		name: 'deleteNodes',
		description: 'Deletes the target nodes',
		tags: [mindmapGroupTag, mindmapNodeTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	const { nodes } = useQueryParams(ctx, {
		nodes: z.string().array(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const node = await MindmapService.deleteNodes(worldId, nodes)

	RedisService.notifyAboutMindmapNodesDelete(ctx, { worldId, nodes })

	return node
})

router.post('/api/world/:worldId/mindmap/wires', async (ctx) => {
	useApiEndpoint({
		name: 'createMindmapWire',
		description: 'Creates a new mindmap wire between two nodes',
		tags: [mindmapGroupTag, mindmapWireTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		sourceNodeId: z.string(),
		targetNodeId: z.string(),
	})

	if (params.sourceNodeId === params.targetNodeId) {
		throw new BadRequestError('Source and target nodes cannot be the same')
	}

	const wire = await MindmapService.createLink(params)
	RedisService.notifyAboutMindmapWireUpdate(ctx, { worldId, wire })

	return wire
})

router.patch('/api/world/:worldId/mindmap/wires/:wireId', async (ctx) => {
	useApiEndpoint({
		name: 'updateMindmapWire',
		description: 'Updates the target mindmap wire',
		tags: [mindmapGroupTag, mindmapWireTag],
	})

	const { worldId, wireId } = usePathParams(ctx, {
		worldId: z.string(),
		wireId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		direction: z.enum(MindmapLinkDirection).optional(),
		content: z.string().optional(),
	})

	const wire = await MindmapService.updateLink(wireId, params)
	RedisService.notifyAboutMindmapWireUpdate(ctx, { worldId, wire })

	return wire
})

router.delete('/api/world/:worldId/mindmap/wires', async (ctx) => {
	useApiEndpoint({
		name: 'deleteMindmapWires',
		description: 'Deletes specified mindmap wires',
		tags: [mindmapGroupTag, mindmapWireTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	const { wires } = useQueryParams(ctx, {
		wires: z.string().array(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	await MindmapService.deleteLinks(worldId, wires)
	RedisService.notifyAboutMindmapWiresDelete(ctx, { worldId, wires })

	return wires
})

export const MindmapRouter = router
