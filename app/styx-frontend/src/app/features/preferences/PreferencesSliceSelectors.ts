import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '../../store'

const getRootPreferences = (state: RootState) => state.preferences

export const getUserPreferences = createSelector([getRootPreferences], (state) => ({
	colorMode: state.colorMode,
}))
export const getEditingPreferences = (state: RootState) => state.preferences.editing
export const getTimelinePreferences = (state: RootState) => state.preferences.timeline
export const getOutlinerPreferences = (state: RootState) => state.preferences.outliner
export const getOverviewPreferences = (state: RootState) => state.preferences.overview
export const getWikiPreferences = (state: RootState) => state.preferences.wiki
export const getReadModeEnabled = createSelector([getWikiPreferences], (state) => ({
	readModeEnabled: state.readModeEnabled,
}))
