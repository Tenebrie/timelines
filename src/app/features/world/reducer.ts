import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { StoryEvent, StoryEventBundle } from './types'

const initialState = {
	name: '' as string,
	events: [] as StoryEvent[],

	hoveredEventMarkers: [] as (StoryEvent | StoryEventBundle)[],

	outliner: {
		selectedTime: null as number | null,
	},

	eventEditor: {
		eventId: null as string | null,
	},

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},
}

export const worldSlice = createSlice({
	name: 'world',
	initialState,
	reducers: {
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},

		/* World events */
		createWorldEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.concat(payload)
		},

		updateWorldEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.filter((event) => event.id !== payload.id)
			state.events = state.events.concat(payload)
		},

		deleteWorldEvent: (state, { payload }: PayloadAction<string>) => {
			state.events = state.events.filter((event) => event.id !== payload)
		},

		hoverEventMarker: (state, { payload }: PayloadAction<StoryEvent | StoryEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.concat(payload)
		},

		unhoverEventMarker: (state, { payload }: PayloadAction<StoryEvent | StoryEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.filter((marker) => marker.id !== payload.id)
		},

		/* Outliner */
		setSelectedOutlinerTime: (state, { payload }: PayloadAction<number | null>) => {
			state.outliner.selectedTime = payload
		},

		/* Event editor */
		setEditorEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.eventEditor.eventId = payload.id
		},

		clearEditorEvent: (state) => {
			state.eventEditor.eventId = null
		},

		/* Event wizard */
		openEventWizard: (state, { payload }: PayloadAction<{ timestamp: number }>) => {
			state.eventWizard.isOpen = true
			state.eventWizard.timestamp = payload.timestamp
		},

		closeEventWizard: (state) => {
			state.eventWizard.isOpen = false
		},
	},
})

export type TimelineState = typeof initialState
export default worldSlice.reducer
