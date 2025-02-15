import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { TimelineTrack } from './components/TimelineTracks/hooks/useEventTracks'
import { ScaleLevel } from './types'

export const initialState = {
	scaleLevel: 0 as ScaleLevel,
	tracks: [] as TimelineTrack[],
	markers: [] as TimelineTrack['events'],
}

export const timelineSlice = createSlice({
	name: 'timeline',
	initialState,
	reducers: {
		/* Timeline */
		setScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.scaleLevel = payload
		},
		setTracks: (state, { payload }: PayloadAction<TimelineTrack[]>) => {
			state.tracks = payload
			state.markers = payload.flatMap((track) => track.events)
		},
	},
})

export type TimelineState = typeof initialState
export const timelineInitialState = initialState
export default timelineSlice.reducer
