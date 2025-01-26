import { GetWorldInfoApiResponse } from '@api/worldDetailsApi'

import { WorldEvent, WorldEventDelta } from '../features/worldTimeline/types'
import { isNotNull } from './isNotNull'

export const ingestActor = (rawActor: GetWorldInfoApiResponse['actors'][number]) => {
	return {
		...rawActor,
		createdAt: Number(rawActor.createdAt),
		updatedAt: Number(rawActor.updatedAt),
	}
}

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
