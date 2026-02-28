import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ScaleLevel } from '@/app/schema/ScaleLevel'

import type { TimelineTrack } from './hooks/useEventTracks'

export const initialState = {
	scroll: 0,
	isSwitchingScale: false,
	scaleLevel: 0 as ScaleLevel,
	targetScaleLevel: 0 as ScaleLevel,
	containerWidth: 0 as number,
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
		setScroll: (state, { payload }: PayloadAction<number>) => {
			state.scroll = payload
		},
		setIsSwitchingScale: (state, { payload }: PayloadAction<boolean>) => {
			state.isSwitchingScale = payload
		},
		setScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.scaleLevel = payload
		},
		setTargetScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.targetScaleLevel = payload
		},
		setContainerWidth: (state, { payload }: PayloadAction<number>) => {
			state.containerWidth = payload
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
export const TimelineReducer = timelineSlice.reducer
