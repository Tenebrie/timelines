import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	time: {},
	timeline: {
		pixelsPerLine: 10 as number,
	},
}

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		setPixelsPerLine: (state, { payload }: PayloadAction<number>) => {
			state.timeline.pixelsPerLine = payload
		},
	},
})

export type PreferencesState = typeof initialState

export default preferencesSlice.reducer
