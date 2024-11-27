import { GetWorldInfoApiResponse } from '@api/worldDetailsApi'

import { WorldEvent, WorldEventDelta } from '../features/world/types'
import { isNotNull } from './isNotNull'

export const ingestEvent = (rawEvent: GetWorldInfoApiResponse['events'][number]): WorldEvent => {
	return {
		...rawEvent,
		timestamp: Number(rawEvent.timestamp),
		revokedAt: isNotNull(rawEvent.revokedAt) ? Number(rawEvent.revokedAt) : undefined,
		deltaStates: rawEvent.deltaStates.map((delta) => ingestEventDelta(delta)),
	}
}

export const ingestEventDelta = (
	rawDelta: GetWorldInfoApiResponse['events'][number]['deltaStates'][number],
): WorldEventDelta => {
	return {
		...rawDelta,
		timestamp: Number(rawDelta.timestamp),
	}
}
