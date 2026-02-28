import { Actor, WorldEvent } from '@api/types/worldTypes'
import { WikiArticle } from '@api/types/worldWikiTypes'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ScaleLevel } from '../../schema/ScaleLevel'
import { CalendarUnitEditorTab } from '../time/calendar/unitEditor/CalendarUnitEditor'
import { loadPreferences, PreferencesKey } from './utils/loadPreferences'

const initialState = loadPreferences() as Required<ReturnType<typeof loadPreferences>>

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
			wiki: {
				...state.wiki,
				expandedFolders: [],
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
			state['calendarEditor'] = value['calendarEditor']
			state['colorMode'] = value['colorMode']
			state['iconSets'] = value['iconSets']
			state['outliner'] = value['outliner']
			state['overview'] = value['overview']
			state['timeline'] = value['timeline']
			state['wiki'] = value['wiki']
		},

		/* Calendar Editor */
		setExpandedCalendarUnitSections: (state, { payload }: PayloadAction<CalendarUnitEditorTab[]>) => {
			state.calendarEditor.expandedUnitSections = payload
			saveToLocalStorage(state)
		},
		toggleExpandedCalendarUnitSection: (state, { payload }: PayloadAction<CalendarUnitEditorTab>) => {
			if (state.calendarEditor.expandedUnitSections.includes(payload)) {
				state.calendarEditor.expandedUnitSections = state.calendarEditor.expandedUnitSections.filter(
					(tab) => tab !== payload,
				)
			} else {
				state.calendarEditor.expandedUnitSections = [...state.calendarEditor.expandedUnitSections, payload]
			}
			saveToLocalStorage(state)
		},

		/* Color Mode */
		setColorMode: (state, { payload }: PayloadAction<'light' | 'dark'>) => {
			state.colorMode = payload
			saveToLocalStorage(state)
		},

		/* Icon Sets */
		setRecentIconSets: (state, { payload }: PayloadAction<string[]>) => {
			state.iconSets.recent = payload
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

		/* Timeline */
		setTimelineHeight: (state, { payload }: PayloadAction<number>) => {
			state.timeline.containerHeight = payload
			saveToLocalStorage(state)
		},
		setScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.timeline.scaleLevel = payload
			saveToLocalStorage(state)
		},
		setReduceAnimations: (state, { payload }: PayloadAction<boolean>) => {
			state.timeline.reduceAnimations = payload
			saveToLocalStorage(state)
		},

		/* Wiki */
		setReadMode: (state, { payload }: PayloadAction<boolean>) => {
			state.wiki.readModeEnabled = payload
			saveToLocalStorage(state)
		},
		collapseWikiFolder: (state, { payload }: PayloadAction<WikiArticle>) => {
			state.wiki.expandedFolders = state.wiki.expandedFolders.filter((id) => id !== payload.id)
			saveToLocalStorage(state)
		},
		uncollapseWikiFolder: (state, { payload }: PayloadAction<WikiArticle>) => {
			state.wiki.expandedFolders = [...new Set([...state.wiki.expandedFolders, payload.id])]
			saveToLocalStorage(state)
		},
	},
})

export type PreferencesState = typeof initialState
export const preferencesInitialState = initialState

export const PreferencesReducer = preferencesSlice.reducer
