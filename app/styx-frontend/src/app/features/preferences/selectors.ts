import { RootState } from '../../store'

export const getUserPreferences = (state: RootState) => state.preferences
export const getTimelinePreferences = (state: RootState) => state.preferences.timeline
export const getOutlinerPreferences = (state: RootState) => state.preferences.outliner
export const getOverviewPreferences = (state: RootState) => state.preferences.overview
export const getWikiPreferences = (state: RootState) => state.preferences.wiki
