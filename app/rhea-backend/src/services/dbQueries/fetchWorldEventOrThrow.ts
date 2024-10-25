import { BadRequestError } from 'moonflower'

import { getPrismaClient } from '../dbClients/DatabaseClient'

export const fetchWorldEventOrThrow = async (eventId: string) => {
	const event = await getPrismaClient().worldEvent.findFirst({
		where: {
			id: eventId,
		},
	})
	if (!event) {
		throw new BadRequestError(`Unable to find event.`)
	}
	return event
}
