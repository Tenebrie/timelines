import { GetWorldInfoApiResponse, GetWorldsApiResponse } from '../../../api/rheaApi'

export type ActorDetails = GetWorldInfoApiResponse['actors'][number]
export type Actor = Omit<ActorDetails, 'statements' | 'relationships' | 'receivedRelationships'>
export type WorldItem = GetWorldsApiResponse[number]
export type WorldDetails = Omit<GetWorldInfoApiResponse, 'events'> & {
	events: WorldEvent[]
}
export type WorldEvent = Omit<GetWorldInfoApiResponse['events'][number], 'timestamp' | 'revokedAt'> & {
	timestamp: number
	revokedAt?: number
}
export type WorldEventType = WorldEvent['type']
export type WorldCalendarType = WorldDetails['calendar']

export type WorldEventBundle = {
	id: string
	events: WorldEvent[]
	type: 'BUNDLE'
	name: string
	timestamp: number
	icon: 'bundle'
}

export type WorldEventGroup = {
	events: (WorldEvent | WorldEventBundle)[]
	timestamp: number
}

export type WorldEventModule = WorldEvent['extraFields'][number]
