import { MindmapLinkDirection } from '@prisma/client'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { UserAuthMiddleware } from '@src/middleware/UserAuthMiddleware.js'
import { ActorService } from '@src/services/ActorService.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { MindmapService } from '@src/services/MindmapService.js'
import { RedisService } from '@src/services/RedisService.js'
import { BadRequestError, Router, useApiEndpoint, usePathParams, useRequestBody } from 'moonflower'
import z from 'zod'

import { mindmapTag } from './utils/tags.js'

const router = new Router().with(SessionMiddleware).with(UserAuthMiddleware)

router.get('/api/world/:worldId/mindmap', async (ctx) => {
	useApiEndpoint({
		name: 'getMindmap',
		description: 'Gets the mindmap for the target world',
		tags: [mindmapTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserReadAccessById(ctx.user, worldId)

	return {
		nodes: await MindmapService.getNodes(worldId),
		links: await MindmapService.getLinks(worldId),
	}
})

router.post('/api/world/:worldId/mindmap/node', async (ctx) => {
	useApiEndpoint({
		name: 'createNode',
		description: 'Creates a new node',
		tags: [mindmapTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
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

router.patch('/api/world/:worldId/mindmap/node/:nodeId', async (ctx) => {
	useApiEndpoint({
		name: 'updateNode',
		description: 'Updates the target node',
		// tags: [mindmapTag],
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

router.delete('/api/world/:worldId/mindmap/node/:nodeId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteNode',
		description: 'Deletes the target node',
		tags: [mindmapTag],
	})

	const { worldId, nodeId } = usePathParams(ctx, {
		worldId: z.string(),
		nodeId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const node = await MindmapService.deleteNode(nodeId)

	RedisService.notifyAboutMindmapNodeUpdate(ctx, { worldId, node })

	return node
})

router.post('/api/world/:worldId/mindmap/link', async (ctx) => {
	useApiEndpoint({
		name: 'createMindmapLink',
		description: 'Creates a new mindmap link between two nodes',
		tags: [mindmapTag],
	})

	const { worldId } = usePathParams(ctx, {
		worldId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		sourceNodeId: z.string(),
		targetNodeId: z.string(),
	})

	const link = await MindmapService.createLink(params)

	return link
})

router.patch('/api/world/:worldId/mindmap/link/:linkId', async (ctx) => {
	useApiEndpoint({
		name: 'updateMindmapLink',
		description: 'Updates the target mindmap link',
		tags: [mindmapTag],
	})

	const { worldId, linkId } = usePathParams(ctx, {
		worldId: z.string(),
		linkId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const params = useRequestBody(ctx, {
		direction: z.enum(MindmapLinkDirection).optional(),
		content: z.string().optional(),
	})

	const link = await MindmapService.updateLink(linkId, params)
	RedisService.notifyAboutMindmapLinkUpdate(ctx, { worldId, link })

	return link
})

router.delete('/api/world/:worldId/mindmap/link/:linkId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteMindmapLink',
		description: 'Deletes the target mindmap link',
		tags: [mindmapTag],
	})

	const { worldId, linkId } = usePathParams(ctx, {
		worldId: z.string(),
		linkId: z.string(),
	})

	await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)

	const link = await MindmapService.deleteLink(linkId)
	RedisService.notifyAboutMindmapLinkUpdate(ctx, { worldId, link })

	return link
})

export const MindmapRouter = router
