import { Prisma } from '@prisma/client'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const makeTouchCalendarQuery = (calendarId: string, prisma?: Prisma.TransactionClient) => {
	return getPrismaClient(prisma).calendar.update({
		where: {
			id: calendarId,
		},
		data: {
			id: calendarId,
		},
		select: {
			id: true,
			updatedAt: true,
		},
	})
}
