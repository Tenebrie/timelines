import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { Actor, WorldEvent } from '../world/types'

const initialState = {
	colorMode: 'dark' as 'light' | 'dark',
	timeline: {
		useCustomLineSpacing: false as boolean,
		lineSpacing: 10 as number,
	},
	outliner: {
		tabIndex: 0 as number,
		showInactiveStatements: false as boolean,
		expandedActors: [] as string[],
		expandedEvents: [] as string[],
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
	window.localStorage.setItem(
		'userPreferences/v1',
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
			const value = window.localStorage.getItem('userPreferences/v1')
			if (!value) {
				return
			}

			try {
				const parsedValue = JSON.parse(value) as PreferencesState
				const tabIndexValue = parsedValue?.outliner?.tabIndex
				if (tabIndexValue) {
					state.outliner.tabIndex = tabIndexValue
				}
				state.colorMode = parsedValue?.colorMode ?? 'dark'
				state.timeline.useCustomLineSpacing = !!parsedValue?.timeline?.useCustomLineSpacing
				state.timeline.lineSpacing = parsedValue?.timeline?.lineSpacing ?? 10
				state.outliner.showInactiveStatements = !!parsedValue?.outliner?.showInactiveStatements
				state.outliner.expandedActors = parsedValue?.outliner?.expandedActors ?? []
				state.outliner.expandedEvents = parsedValue?.outliner?.expandedEvents ?? []
				state.overview.panelOpen = !!parsedValue?.overview?.panelOpen
				state.overview.actorsOpen = !!parsedValue?.overview?.actorsOpen
				state.overview.actorsReversed = !!parsedValue?.overview?.actorsReversed
				state.overview.eventsOpen = !!parsedValue?.overview?.eventsOpen
				state.overview.eventsReversed = !!parsedValue?.overview?.eventsReversed
			} catch {
				return
			}
		},

		setColorMode: (state, { payload }: PayloadAction<'light' | 'dark'>) => {
			state.colorMode = payload
			saveToLocalStorage(state)
		},

		/* Timeline */
		setUseCustomTimelineSpacing: (state, { payload }: PayloadAction<boolean>) => {
			state.timeline.useCustomLineSpacing = payload
			if (payload === false) {
				state.timeline.lineSpacing = initialState.timeline.lineSpacing
			}
			saveToLocalStorage(state)
		},
		setTimelineSpacing: (state, { payload }: PayloadAction<number>) => {
			state.timeline.lineSpacing = payload
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
