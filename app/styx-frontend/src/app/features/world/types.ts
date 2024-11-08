import {
	GetWorldBriefApiResponse,
	GetWorldEventTracksApiResponse,
	GetWorldInfoApiResponse,
	GetWorldsApiResponse,
} from '../../../api/rheaApi'

export type ActorDetails = GetWorldInfoApiResponse['actors'][number]
export type Actor = Omit<ActorDetails, 'statements' | 'relationships' | 'receivedRelationships'>
export type WorldItem = GetWorldsApiResponse['ownedWorlds'][number]
export type WorldBrief = GetWorldBriefApiResponse
export type WorldDetails = Omit<GetWorldInfoApiResponse, 'events'> & {
	events: WorldEvent[]
}
export type WorldEvent = Omit<
	GetWorldInfoApiResponse['events'][number],
	'timestamp' | 'revokedAt' | 'deltaStates'
> & {
	timestamp: number
	revokedAt?: number
	deltaStates: (Omit<GetWorldInfoApiResponse['events'][number]['deltaStates'][number], 'timestamp'> & {
		timestamp: number
	})[]
}
export type WorldEventDelta = WorldEvent['deltaStates'][number]
export type WorldEventType = WorldEvent['type']
export type WorldCalendarType = WorldDetails['calendar']

export type WorldEventBundle = {
	id: string
	key: string
	events: WorldEvent[]
	markerType: 'bundle'
	name: string
	timestamp: number
	icon: 'bundle'
}

export type MarkerType = 'issuedAt' | 'deltaState' | 'revokedAt' | 'ghostEvent' | 'ghostDelta'
export type TimelineEntity<T extends MarkerType> = WorldEvent & {
	eventId: string
	key: string
	markerPosition: number
	markerType: T
	baseEntity: T extends 'issuedAt'
		? WorldEvent
		: T extends 'revokedAt'
			? WorldEvent
			: T extends 'deltaState'
				? WorldEventDelta
				: null
	nextEntity: TimelineEntity<MarkerType> | null
}

export type WorldEventModule = WorldEvent['extraFields'][number]
export type WorldAccessMode = WorldBrief['accessMode']

export type WorldEventTrack = GetWorldEventTracksApiResponse[number]
