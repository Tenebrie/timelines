import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { TimelineTrack } from './components/TimelineTracks/hooks/useEventTracks'
import { ScaleLevel } from './types'

export const initialState = {
	scaleLevel: 0 as ScaleLevel,
	loadingTracks: true,
	// Only those with `visible: true`
	tracks: [] as TimelineTrack[],
	markers: [] as TimelineTrack['events'],
	// Ignoring `visible` filter
	allTracks: [] as TimelineTrack[],
	allMarkers: [] as TimelineTrack['events'],
}

export const timelineSlice = createSlice({
	name: 'timeline',
	initialState,
	reducers: {
		/* Timeline */
		setScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.scaleLevel = payload
		},
		setTracks: (
			state,
			{ payload }: PayloadAction<{ tracks: TimelineTrack[]; allTracks: TimelineTrack[]; isLoading: boolean }>,
		) => {
			state.loadingTracks = payload.isLoading
			state.tracks = payload.tracks
			state.markers = payload.tracks.flatMap((track) => track.events)
			state.allTracks = payload.allTracks
			state.allMarkers = payload.allTracks.flatMap((track) => track.events)
		},
	},
})

export type TimelineState = typeof initialState
export const timelineInitialState = initialState
export default timelineSlice.reducer
