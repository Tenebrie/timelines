import React, { createContext, useState } from 'react'

import { createStoryEvent, StoryEvent } from '../types/StoryEvent'
import { EmptyFunction } from '../utils/utils'

type ContextType = {
	storyEvents: StoryEvent[]
	addStoryEvent: (event: StoryEvent) => void
}

const mockDefaultValue: ContextType = {
	storyEvents: [],
	addStoryEvent: EmptyFunction,
}

export const GlobalContext = createContext<ContextType>(mockDefaultValue)

export const GlobalContextProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([
		createStoryEvent({
			name: 'First event',
			timestamp: 0,
		}),
		createStoryEvent({
			name: 'Second event',
			timestamp: 0.5,
		}),
		createStoryEvent({
			name: 'Third event',
			timestamp: 5,
		}),
		createStoryEvent({
			name: 'Third and a bit event',
			timestamp: 6,
		}),
		createStoryEvent({
			name: 'Third and some more event',
			timestamp: 7,
		}),
		createStoryEvent({
			name: 'Third and extra some more event',
			timestamp: 8,
		}),
		createStoryEvent({
			name: 'Fourth event',
			timestamp: 121,
		}),
		createStoryEvent({
			name: 'Fifth event',
			timestamp: 122,
		}),
		createStoryEvent({
			name: 'Sixth event',
			timestamp: 123,
		}),
		createStoryEvent({
			name: 'Seventh event',
			timestamp: 124,
		}),
		createStoryEvent({
			name: '8 event',
			timestamp: 250,
		}),
		createStoryEvent({
			name: '9 event',
			timestamp: 500,
		}),
		createStoryEvent({
			name: '10 event',
			timestamp: 750,
		}),
		createStoryEvent({
			name: '11 event',
			timestamp: 1500,
		}),
		createStoryEvent({
			name: '12 event',
			timestamp: 2500,
		}),
	])

	const addStoryEvent = (event: StoryEvent) => {
		const newEvents = storyEvents.concat(event).sort((a, b) => a.timestamp - b.timestamp)
		setStoryEvents(newEvents)
	}

	return <GlobalContext.Provider value={{ storyEvents, addStoryEvent }}>{children}</GlobalContext.Provider>
}
