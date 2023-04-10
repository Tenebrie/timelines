import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	time: {},
	timeline: {
		lineSpacing: 10 as number,
	},
	overview: {
		panelOpen: true as boolean,
		eventsOpen: true as boolean,
		eventsReversed: false as boolean,
		statementsOpen: true as boolean,
		statementsReversed: false as boolean,
	},
}

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		/* Timeline */
		setPixelsPerLine: (state, { payload }: PayloadAction<number>) => {
			state.timeline.lineSpacing = payload
		},

		/* Overview */
		setPanelOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.panelOpen = payload
		},
		setEventsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.eventsOpen = payload
		},
		setEventsReversed: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.eventsReversed = payload
		},
		setStatementsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.statementsOpen = payload
		},
		setStatementsReversed: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.statementsReversed = payload
		},
	},
})

export type PreferencesState = typeof initialState

export default preferencesSlice.reducer
