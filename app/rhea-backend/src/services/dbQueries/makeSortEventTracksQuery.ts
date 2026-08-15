import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const makeSortEventTracksQuery = async (worldId: string, prisma?: Prisma.TransactionClient) => {
	prisma = prisma ?? getPrismaClient()

	const tracks = await prisma.worldEventTrack.findMany({
		where: {
			worldId,
		},
		orderBy: {
			position: 'asc',
		},
		select: {
			id: true,
		},
	})

	return Promise.all(
		tracks.map((track, index) => {
			return prisma.worldEventTrack.update({
				where: {
					id: track.id,
				},
				data: {
					position: index * 2,
				},
			})
		}),
	)
}
