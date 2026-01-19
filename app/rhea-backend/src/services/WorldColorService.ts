import { getPrismaClient } from '@src/services/dbClients/DatabaseClient.js'

export const WorldColorService = {
	listColors: async (params: { worldId: string }) => {
		return getPrismaClient().savedColor.findMany({
			where: {
				worldId: params.worldId,
			},
			orderBy: {
				createdAt: 'asc',
			},
		})
	},

	createColor: async (params: { worldId: string; value: string; label?: string }) => {
		return await getPrismaClient().savedColor.create({
			data: {
				worldId: params.worldId,
				value: params.value,
				label: params.label,
			},
		})
	},

	deleteColor: async (params: { colorId: string }) => {
		await getPrismaClient().savedColor.delete({
			where: {
				id: params.colorId,
			},
		})
	},
}
