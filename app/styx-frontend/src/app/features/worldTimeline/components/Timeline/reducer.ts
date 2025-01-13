import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ScaleLevel } from './types'

export const initialState = {
	scaleLevel: 0 as ScaleLevel,
}

export const timelineSlice = createSlice({
	name: 'timeline',
	initialState,
	reducers: {
		/* Timeline */
		setScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.scaleLevel = payload
		},
	},
})

export type TimelineState = typeof initialState
export const timelineInitialState = initialState
export default timelineSlice.reducer
