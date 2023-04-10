import { RootState } from '../../store'

export const getTimelinePreferences = (state: RootState) => state.preferences.timeline
export const getOverviewPreferences = (state: RootState) => state.preferences.overview
