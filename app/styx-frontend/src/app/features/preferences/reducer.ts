import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	time: {},
	timeline: {
		lineSpacing: 20 as number,
	},
}

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		setPixelsPerLine: (state, { payload }: PayloadAction<number>) => {
			state.timeline.lineSpacing = payload
		},
	},
})

export type PreferencesState = typeof initialState

export default preferencesSlice.reducer
