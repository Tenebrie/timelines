import { GetWorldInfoApiResponse } from '../../../api/rheaApi'

export type WorldDetails = GetWorldInfoApiResponse
export type WorldEvent = GetWorldInfoApiResponse['events'][number]
export type WorldStatement = WorldEvent['issuedStatements'][number]
export type WorldEventType = WorldEvent['type']

export type WorldEventBundle = {
	id: string
	events: WorldEvent[]
	type: 'BUNDLE'
	name: string
	timestamp: number
}

export type WorldEventGroup = {
	events: (WorldEvent | WorldEventBundle)[]
	timestamp: number
}
