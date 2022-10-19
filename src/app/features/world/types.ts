export type StoryEventType = 'scene' | 'other'

export type StoryEvent = {
	id: string
	type: StoryEventType
	name: string
	timestamp: number
	description: string
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
