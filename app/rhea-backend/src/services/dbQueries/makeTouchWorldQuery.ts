import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeTouchWorldQuery = (worldId: string, prisma?: Prisma.TransactionClient) => {
	return getPrismaClient(prisma).world.update({
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
}
