import { GetWorldInfoApiResponse, GetWorldsApiResponse } from '../../../api/rheaApi'

export type Actor = GetWorldInfoApiResponse['actors'][number]
export type WorldItem = GetWorldsApiResponse[number]
export type WorldDetails = Omit<GetWorldInfoApiResponse, 'events'> & {
	events: WorldEvent[]
}
export type WorldEvent = Omit<GetWorldInfoApiResponse['events'][number], 'timestamp'> & {
	timestamp: number
}
export type WorldStatement = WorldEvent['issuedStatements'][number]
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
