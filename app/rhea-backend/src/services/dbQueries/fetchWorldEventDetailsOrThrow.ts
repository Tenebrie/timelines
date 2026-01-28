import { Prisma } from '@prisma/client'
import { BadRequestError } from 'moonflower'

import { getPrismaClient } from '../dbClients/DatabaseClient.js'

export const fetchWorldEventDetailsOrThrow = async (eventId: string, prisma?: Prisma.TransactionClient) => {
	const event = await getPrismaClient(prisma).worldEvent.findFirst({
		where: {
			id: eventId,
		},
		include: {
			mentions: true,
			mentionedIn: true,
			deltaStates: true,
		},
		omit: {
			descriptionYjs: true,
		},
	})
	if (!event) {
		throw new BadRequestError(`Unable to find event.`)
	}
	return event
}
