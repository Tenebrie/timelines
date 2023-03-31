import { GetWorldInfoApiResponse } from '../../../api/rheaApi'

export type StoryEventType = 'scene' | 'other'

export type StoryEvent = {
	id: string
	type: StoryEventType
	name: string
	timestamp: number
	description: string
	issuedWorldStatements: WorldStatement[]
	revokedWorldStatements: string[]
}

export type StoryEventBundle = {
	id: string
	events: StoryEvent[]
	type: 'bundle'
	name: string
	timestamp: number
}

export type StoryEventGroup = {
	events: (StoryEvent | StoryEventBundle)[]
	timestamp: number
}

export type WorldStatement = {
	id: string
	name: string
	text: string
}

export type WorldDetails = GetWorldInfoApiResponse
