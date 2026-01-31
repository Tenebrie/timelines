import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const makeSortCalendarUnitsQuery = async (calendarId: string, prisma?: Prisma.TransactionClient) => {
	prisma = prisma ?? getPrismaClient()

	const units = await prisma.calendarUnit.findMany({
		where: {
			calendarId,
		},
		orderBy: {
			position: 'asc',
		},
		select: {
			id: true,
		},
	})

	return Promise.all(
		units.map((unit, index) => {
			return prisma.calendarUnit.update({
				where: {
					id: unit.id,
				},
				data: {
					position: index * 2,
				},
			})
		}),
	)
}
