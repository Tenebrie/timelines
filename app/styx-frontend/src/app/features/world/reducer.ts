import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { WorldDetails, WorldEvent, WorldEventBundle } from './types'

const initialState = {
	id: '' as string,
	name: '' as string,
	events: [] as WorldEvent[],

	hoveredEventMarkers: [] as (WorldEvent | WorldEventBundle)[],

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
		setId: (state, { payload }: PayloadAction<string>) => {
			state.id = payload
		},
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},
		loadWorld: (state, { payload }: PayloadAction<WorldDetails>) => {
			state.id = payload.id
			state.name = payload.name
		},

		/* World events */
		createWorldEvent: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.events = state.events.concat(payload)
		},

		updateWorldEvent: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.events = state.events.filter((event) => event.id !== payload.id)
			state.events = state.events.concat(payload)
		},

		deleteWorldEvent: (state, { payload }: PayloadAction<string>) => {
			state.events = state.events.filter((event) => event.id !== payload)
		},

		hoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.concat(payload)
		},

		unhoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.filter((marker) => marker.id !== payload.id)
		},

		/* Event editor */
		setEditorEvent: (state, { payload }: PayloadAction<WorldEvent>) => {
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
