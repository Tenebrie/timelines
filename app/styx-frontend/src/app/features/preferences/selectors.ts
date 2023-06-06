import { RootState } from '../../store'

export const getTimelinePreferences = (state: RootState) => state.preferences.timeline
export const getOutlinerPreferences = (state: RootState) => state.preferences.outliner
export const getOverviewPreferences = (state: RootState) => state.preferences.overview
