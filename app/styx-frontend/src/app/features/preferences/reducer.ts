import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { Actor, WorldEvent } from '../world/types'
import { loadPreferences, PreferencesKey } from './loadPreferences'

const initialState = loadPreferences()

const saveToLocalStorage = (state: PreferencesState) => {
	window.localStorage.setItem(
		PreferencesKey,
		JSON.stringify({
			...state,
			outliner: {
				...state.outliner,
				// Do not save expanded entities into storage as it may grow too large
				expandedActors: [],
				expandedEvents: [],
			},
		}),
	)
}

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		loadFromLocalStorage: (state) => {
			const value = loadPreferences()
			state['colorMode'] = value['colorMode']
			state['timeline'] = value['timeline']
			state['outliner'] = value['outliner']
			state['overview'] = value['overview']
		},

		setColorMode: (state, { payload }: PayloadAction<'light' | 'dark'>) => {
			state.colorMode = payload
			saveToLocalStorage(state)
		},

		/* Timeline */
		setTimelineHeight: (state, { payload }: PayloadAction<number>) => {
			state.timeline.containerHeight = payload
			saveToLocalStorage(state)
		},

		/* Outliner */
		setOutlinerTab: (state, { payload }: PayloadAction<number>) => {
			state.outliner.tabIndex = payload
			saveToLocalStorage(state)
		},
		setShowInactiveStatements: (state, { payload }: PayloadAction<boolean>) => {
			state.outliner.showInactiveStatements = payload
			saveToLocalStorage(state)
		},
		collapseActorInOutliner: (state, { payload }: PayloadAction<Actor>) => {
			state.outliner.expandedActors = state.outliner.expandedActors.filter((id) => id !== payload.id)
			saveToLocalStorage(state)
		},
		uncollapseActorInOutliner: (state, { payload }: PayloadAction<Actor>) => {
			state.outliner.expandedActors = [...new Set([...state.outliner.expandedActors, payload.id])]
			saveToLocalStorage(state)
		},
		collapseEventInOutliner: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.outliner.expandedEvents = state.outliner.expandedEvents.filter((id) => id !== payload.id)
			saveToLocalStorage(state)
		},
		uncollapseEventInOutliner: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.outliner.expandedEvents = [...new Set([...state.outliner.expandedEvents, payload.id])]
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
