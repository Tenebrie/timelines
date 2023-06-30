import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { Actor, WorldEvent } from '../world/types'

const initialState = {
	time: {},
	timeline: {
		lineSpacing: 10 as number,
	},
	outliner: {
		showOnlySelected: false as boolean,
		showInactiveStatements: false as boolean,
		collapsedActors: [] as string[],
		collapsedEvents: [] as string[],
	},
	overview: {
		panelOpen: true as boolean,
		actorsOpen: true as boolean,
		actorsReversed: false as boolean,
		eventsOpen: true as boolean,
		eventsReversed: false as boolean,
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
				state.outliner.showOnlySelected = !!parsedValue?.outliner?.showOnlySelected
				state.outliner.showInactiveStatements = !!parsedValue?.outliner?.showInactiveStatements
				state.outliner.collapsedActors = parsedValue?.outliner?.collapsedActors ?? []
				state.outliner.collapsedEvents = parsedValue?.outliner?.collapsedEvents ?? []
				state.overview.panelOpen = !!parsedValue?.overview?.panelOpen
				state.overview.actorsOpen = !!parsedValue?.overview?.actorsOpen
				state.overview.actorsReversed = !!parsedValue?.overview?.actorsReversed
				state.overview.eventsOpen = !!parsedValue?.overview?.eventsOpen
				state.overview.eventsReversed = !!parsedValue?.overview?.eventsReversed
			} catch (err) {
				return
			}
		},

		/* Timeline */
		setPixelsPerLine: (state, { payload }: PayloadAction<number>) => {
			state.timeline.lineSpacing = payload
		},

		/* Outliner */
		setShowOnlySelected: (state, { payload }: PayloadAction<boolean>) => {
			state.outliner.showOnlySelected = payload
			saveToLocalStorage(state)
		},
		setShowInactiveStatements: (state, { payload }: PayloadAction<boolean>) => {
			state.outliner.showInactiveStatements = payload
			saveToLocalStorage(state)
		},
		collapseActorInOutliner: (state, { payload }: PayloadAction<Actor>) => {
			state.outliner.collapsedActors = [...new Set([...state.outliner.collapsedActors, payload.id])]
			saveToLocalStorage(state)
		},
		uncollapseActorInOutliner: (state, { payload }: PayloadAction<Actor>) => {
			state.outliner.collapsedActors = state.outliner.collapsedActors.filter((id) => id !== payload.id)
			saveToLocalStorage(state)
		},
		collapseEventInOutliner: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.outliner.collapsedEvents = [...new Set([...state.outliner.collapsedEvents, payload.id])]
			saveToLocalStorage(state)
		},
		uncollapseEventInOutliner: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.outliner.collapsedEvents = state.outliner.collapsedEvents.filter((id) => id !== payload.id)
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
	},
})

export type PreferencesState = typeof initialState
export const PreferencesInitialState = initialState

export default preferencesSlice.reducer
