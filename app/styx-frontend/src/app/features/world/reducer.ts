import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { WorldDetails, WorldEvent, WorldEventBundle } from './types'

const initialState = {
	id: '' as string,
	name: '' as string,
	events: [] as WorldEvent[],

	hoveredEventMarkers: [] as (WorldEvent | WorldEventBundle)[],

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
			state.events = payload.events
		},

		hoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.concat(payload)
		},

		unhoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.filter((marker) => marker.id !== payload.id)
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
