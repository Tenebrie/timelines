import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeTouchUserQuery = (userId: string) =>
	getPrismaClient().user.update({
		where: {
			id: userId,
		},
		data: {
			id: userId,
		},
		select: {
			id: true,
			updatedAt: true,
		},
	})
