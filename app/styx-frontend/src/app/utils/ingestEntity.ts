import { GetWorldInfoApiResponse } from '@api/worldDetailsApi'

import { ActorDetails, WorldEvent, WorldEventDelta } from '../../api/types/types'
import { isNotNull } from './isNotNull'

export const ingestActor = (rawActor: GetWorldInfoApiResponse['actors'][number]): ActorDetails => {
	return {
		...rawActor,
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
