import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	time: {},
	timeline: {
		lineSpacing: 10 as number,
	},
	outliner: {
		showEmptyEvents: false as boolean,
		showInactiveStatements: false as boolean,
	},
	overview: {
		panelOpen: true as boolean,
		actorsOpen: true as boolean,
		actorsReversed: false as boolean,
		eventsOpen: true as boolean,
		eventsReversed: false as boolean,
		statementsOpen: true as boolean,
		statementsReversed: false as boolean,
	},
}

const saveToLocalStorage = (state: PreferencesState) => {
	window.localStorage.setItem('userPreferences/v1', JSON.stringify(state))
}

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		loadFromLocalStorage: (state) => {
			const value = window.localStorage.getItem('userPreferences/v1')
			if (!value) {
				return
			}

			try {
				const parsedValue = JSON.parse(value) as PreferencesState
				state.outliner.showEmptyEvents = !!parsedValue?.outliner?.showEmptyEvents
				state.outliner.showInactiveStatements = !!parsedValue?.outliner?.showInactiveStatements
				state.overview.panelOpen = !!parsedValue?.overview?.panelOpen
				state.overview.actorsOpen = !!parsedValue?.overview?.actorsOpen
				state.overview.actorsReversed = !!parsedValue?.overview?.actorsReversed
				state.overview.eventsOpen = !!parsedValue?.overview?.eventsOpen
				state.overview.eventsReversed = !!parsedValue?.overview?.eventsReversed
				state.overview.statementsOpen = !!parsedValue?.overview?.statementsOpen
				state.overview.statementsReversed = !!parsedValue?.overview?.statementsReversed
			} catch (err) {
				return
			}
		},

		/* Timeline */
		setPixelsPerLine: (state, { payload }: PayloadAction<number>) => {
			state.timeline.lineSpacing = payload
		},

		/* Outliner */
		setShowEmptyEvents: (state, { payload }: PayloadAction<boolean>) => {
			state.outliner.showEmptyEvents = payload
			saveToLocalStorage(state)
		},
		setShowInactiveStatements: (state, { payload }: PayloadAction<boolean>) => {
			state.outliner.showInactiveStatements = payload
			saveToLocalStorage(state)
		},

		/* Overview */
		setPanelOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.panelOpen = payload
			saveToLocalStorage(state)
		},
		setActorsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.actorsOpen = payload
			saveToLocalStorage(state)
		},
		setActorsReversed: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.actorsReversed = payload
			saveToLocalStorage(state)
		},
		setEventsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.eventsOpen = payload
			saveToLocalStorage(state)
		},
		setEventsReversed: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.eventsReversed = payload
			saveToLocalStorage(state)
		},
		setStatementsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.statementsOpen = payload
			saveToLocalStorage(state)
		},
		setStatementsReversed: (state, { payload }: PayloadAction<boolean>) => {
			state.overview.statementsReversed = payload
			saveToLocalStorage(state)
		},
	},
})

export type PreferencesState = typeof initialState

export default preferencesSlice.reducer
