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
	async deleteNode(nodeId: string) {
		return getPrismaClient().mindmapNode.delete({
			where: { id: nodeId },
		})
	},

	async getLinks(worldId: string) {
		return getPrismaClient().mindmapLink.findMany({
			where: {
				sourceNode: { worldId },
			},
		})
	},
	async createLink(data: Prisma.MindmapLinkUncheckedCreateInput) {
		return getPrismaClient().mindmapLink.create({
			data,
		})
	},
	async updateLink(linkId: string, params: Prisma.MindmapLinkUpdateInput) {
		return getPrismaClient().mindmapLink.update({
			where: { id: linkId },
			data: params,
		})
	},
	async deleteLink(linkId: string) {
		return getPrismaClient().mindmapLink.delete({
			where: { id: linkId },
		})
	},
}
