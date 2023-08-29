import { BadRequestError } from 'tenebrie-framework'

import { dbClient } from '../DatabaseClient'

export const fetchWorldEventOrThrow = async (eventId: string) => {
	const event = await dbClient.worldEvent.findFirst({
		where: {
			id: eventId,
		},
	})
	if (!event) {
		throw new BadRequestError(`Unable to find event.`)
	}
	return event
}
