import { GetWorldInfoApiResponse, GetWorldsApiResponse } from '../../../api/rheaApi'

export type ActorDetails = GetWorldInfoApiResponse['actors'][number]
export type Actor = Omit<ActorDetails, 'statements' | 'relationships' | 'receivedRelationships'>
export type WorldItem = GetWorldsApiResponse[number]
export type WorldDetails = Omit<GetWorldInfoApiResponse, 'events'> & {
	events: WorldEvent[]
}
export type WorldEvent = Omit<
	GetWorldInfoApiResponse['events'][number],
	'timestamp' | 'revokedAt' | 'replacedBy' | 'replaces'
> & {
	timestamp: number
	revokedAt?: number
	replaces:
		| null
		| (Omit<NonNullable<GetWorldInfoApiResponse['events'][number]['replaces']>, 'timestamp'> & {
				timestamp: number
		  })
	replacedBy:
		| null
		| (Omit<NonNullable<GetWorldInfoApiResponse['events'][number]['replacedBy']>, 'timestamp'> & {
				timestamp: number
		  })
}
export type WorldEventReplaceLink = WorldEvent['replacedBy']
export type WorldEventType = WorldEvent['type']
export type WorldCalendarType = WorldDetails['calendar']

export type WorldEventBundle = {
	id: string
	events: WorldEvent[]
	markerType: 'bundle'
	name: string
	timestamp: number
	icon: 'bundle'
}

export type MarkerType = 'issuedAt' | 'revokedAt' | 'ghost'
export type WorldEventGroup = {
	events: ((WorldEvent & { markerPosition: number; markerType: MarkerType }) | WorldEventBundle)[]
	timestamp: number
}
export type WorldEventOnTimeline = WorldEventGroup['events'][number]

export type WorldEventModule = WorldEvent['extraFields'][number]
