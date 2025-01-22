import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export const makeTouchWorldQuery = (worldId: string, prisma?: Prisma.TransactionClient) => {
	prisma = prisma ?? getPrismaClient()

	return prisma.world.update({
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
