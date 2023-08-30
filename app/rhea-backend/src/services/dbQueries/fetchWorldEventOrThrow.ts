import { BadRequestError } from 'tenebrie-framework'

import { dbClient } from '../DatabaseClient'

export const fetchWorldEventOrThrow = async (
	eventId: string,
	include: {
		deltaStates?: boolean
	} = {}
) => {
	const event = await dbClient.worldEvent.findFirst({
		where: {
			id: eventId,
		},
		include,
	})
	if (!event) {
		throw new BadRequestError(`Unable to find event.`)
	}
	return event
}
