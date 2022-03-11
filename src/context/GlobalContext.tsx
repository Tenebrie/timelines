import React, { createContext, useState } from 'react'

import { StoryEvent } from '../types/StoryEvent'
import { EmptyFunction } from '../utils/utils'

type ContextType = {
	counter: number
	setCounter: (value: number) => void
	bumpCounter: () => void
	storyEvents: StoryEvent[]
	addStoryEvent: (event: StoryEvent) => void
}

const mockDefaultValue: ContextType = {
	counter: 0,
	setCounter: EmptyFunction,
	bumpCounter: EmptyFunction,
	storyEvents: [],
	addStoryEvent: EmptyFunction,
}

export const GlobalContext = createContext<ContextType>(mockDefaultValue)

export const GlobalContextProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [counter, setCounter] = useState(0)
	const bumpCounter = () => setCounter(counter + 1)

	const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([
		{
			name: 'First event',
			timestamp: 0,
		},
		{
			name: 'Second event',
			timestamp: 0.5,
		},
		{
			name: 'Third event',
			timestamp: 5,
		},
		{
			name: 'Third and a bit event',
			timestamp: 6,
		},
		{
			name: 'Third and some more event',
			timestamp: 7,
		},
		{
			name: 'Third and extra some more event',
			timestamp: 8,
		},
		{
			name: 'Fourth event',
			timestamp: 121,
		},
		{
			name: 'Fifth event',
			timestamp: 122,
		},
		{
			name: 'Sixth event',
			timestamp: 123,
		},
		{
			name: 'Seventh event',
			timestamp: 124,
		},
		{
			name: '8 event',
			timestamp: 250,
		},
		{
			name: '9 event',
			timestamp: 500,
		},
		{
			name: '10 event',
			timestamp: 750,
		},
		{
			name: '11 event',
			timestamp: 1500,
		},
		{
			name: '12 event',
			timestamp: 2500,
		},
	])

	const addStoryEvent = (event: StoryEvent) => {
		const newEvents = storyEvents.concat(event).sort((a, b) => a.timestamp - b.timestamp)
		setStoryEvents(newEvents)
	}

	return (
		<GlobalContext.Provider value={{ storyEvents, addStoryEvent, counter, setCounter, bumpCounter }}>
			{children}
		</GlobalContext.Provider>
	)
}
