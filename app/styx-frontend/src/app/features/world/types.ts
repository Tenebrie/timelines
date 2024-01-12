import { GetWorldInfoApiResponse, GetWorldsApiResponse } from '../../../api/rheaApi'

export type ActorDetails = GetWorldInfoApiResponse['actors'][number]
export type Actor = Omit<ActorDetails, 'statements' | 'relationships' | 'receivedRelationships'>
export type WorldItem = GetWorldsApiResponse['ownedWorlds'][number]
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
export type WorldEventGroup = {
	events: (
		| (WorldEvent & { eventId: string; key: string; markerPosition: number; markerType: MarkerType })
		| WorldEventBundle
	)[]
	timestamp: number
}
export type TimelineEntity = WorldEventGroup['events'][number]

export type WorldEventModule = WorldEvent['extraFields'][number]
