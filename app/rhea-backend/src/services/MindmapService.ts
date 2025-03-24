import { Prisma } from '@prisma/client'

import { getPrismaClient } from './dbClients/DatabaseClient'

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
	async deleteNode(nodeId: string) {
		return getPrismaClient().mindmapNode.delete({
			where: { id: nodeId },
		})
	},
}
