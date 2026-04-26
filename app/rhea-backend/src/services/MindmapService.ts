import { Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient.js'

export const MindmapService = {
	async getNodes(worldId: string) {
		return getPrismaClient().mindmapNode.findMany({
			where: {
				worldId,
			},
		})
	},
	async createNode(data: Prisma.MindmapNodeUncheckedCreateInput) {
		return getPrismaClient().mindmapNode.create({
			data,
		})
	},
	async updateNode(nodeId: string, params: Prisma.MindmapNodeUpdateInput) {
		return getPrismaClient().mindmapNode.update({
			where: { id: nodeId },
			data: params,
		})
	},
	async moveNodes(nodes: string[], deltaX: number, deltaY: number) {
		return getPrismaClient().mindmapNode.updateManyAndReturn({
			where: { id: { in: nodes } },
			data: {
				positionX: { increment: deltaX },
				positionY: { increment: deltaY },
			},
		})
	},
	async deleteNodes(worldId: string, nodeIds: string[]) {
		return getPrismaClient().mindmapNode.deleteMany({
			where: {
				id: { in: nodeIds },
				worldId,
			},
		})
	},

	async getLinks(worldId: string) {
		return getPrismaClient().mindmapLink.findMany({
			where: {
				sourceNode: { worldId },
			},
		})
	},
	async createLinks(data: Prisma.MindmapLinkUncheckedCreateInput[]) {
		return getPrismaClient().$transaction(async (prisma) => {
			const existing = await prisma.mindmapLink.findMany({
				where: {
					OR: data.flatMap(({ sourceNodeId, targetNodeId }) => [
						{ sourceNodeId, targetNodeId },
						{ sourceNodeId: targetNodeId, targetNodeId: sourceNodeId }, // Reversed direction
					]),
				},
				select: { id: true, sourceNodeId: true, targetNodeId: true },
			})

			const existingMap = new Map(
				existing.flatMap((e) => [
					[`${e.sourceNodeId}-${e.targetNodeId}`, e],
					[`${e.targetNodeId}-${e.sourceNodeId}`, e],
				]),
			)

			const toCreate: Prisma.MindmapLinkUncheckedCreateInput[] = []
			const directionUpdates: ReturnType<typeof prisma.mindmapLink.update>[] = []

			for (const d of data) {
				const key = `${d.sourceNodeId}-${d.targetNodeId}`
				const match = existingMap.get(key)
				if (!match) {
					toCreate.push(d)
				} else {
					const direction = match.sourceNodeId === d.sourceNodeId ? 'Normal' : 'Reversed'
					directionUpdates.push(
						prisma.mindmapLink.update({
							where: { id: match.id },
							data: { direction },
						}),
					)
				}
			}

			const updated = await Promise.all(directionUpdates)

			if (toCreate.length === 0) {
				return { created: [], updated }
			}

			const created = await prisma.mindmapLink.createManyAndReturn({
				data: toCreate,
			})

			return { created, updated }
		})
	},
	async updateLink(linkId: string, params: Prisma.MindmapLinkUpdateInput) {
		return getPrismaClient().mindmapLink.update({
			where: { id: linkId },
			data: params,
		})
	},
	async deleteLinks(worldId: string, linkIds: string[]) {
		return getPrismaClient().mindmapLink.deleteMany({
			where: {
				id: { in: linkIds },
				sourceNode: { worldId },
			},
		})
	},
}
