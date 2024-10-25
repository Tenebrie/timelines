import { dbClient } from '../dbClients/DatabaseClient'

export const makeTouchWorldQuery = (worldId: string) =>
	dbClient.world.update({
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
