import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeTouchWorldQuery = (worldId: string) =>
	getPrismaClient().world.update({
		where: {
			id: worldId,
		},
		data: {
			id: worldId,
		},
		select: {
			id: true,
			updatedAt: true,
		},
	})
