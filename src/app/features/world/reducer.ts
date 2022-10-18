import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { StoryEvent } from './types'

const initialState = {
	name: '' as string,
	events: [] as StoryEvent[],
}

export const worldSlice = createSlice({
	name: 'world',
	initialState,
	reducers: {
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},

		createEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.concat(payload)
		},

		updateEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.filter((event) => event.id !== payload.id)
			state.events = state.events.concat(payload)
		},
	},
})

export type TimelineState = typeof initialState
// export const { createEvent, updateEvent } = worldSlice.actions;

export default worldSlice.reducer
