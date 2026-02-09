import { GetWorldInfoApiResponse } from '@api/worldDetailsApi'

import {
	ActorDetails,
	WorldCalendar,
	WorldDetails,
	WorldEvent,
	WorldEventDelta,
} from '../../api/types/worldTypes'
import { isNotNull } from './isNotNull'

export const ingestWorld = (rawWorld: GetWorldInfoApiResponse): WorldDetails => {
	return {
		...rawWorld,
		events: rawWorld.events.map(ingestEvent),
		actors: [...rawWorld.actors].sort((a, b) => a.name.localeCompare(b.name)).map((a) => ingestActor(a)),
		timeOrigin: Number(rawWorld.timeOrigin),
		calendars: rawWorld.calendars.map(ingestCalendar),
	}
}

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
		deltaStates: [],
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

export const ingestCalendar = (rawCalendar: GetWorldInfoApiResponse['calendars'][number]): WorldCalendar => {
	return {
		...rawCalendar,
		originTime: Number(rawCalendar.originTime),
	}
}
