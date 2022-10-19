import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { makeStoryEvent } from './creators'
import { StoryEvent } from './types'

const initialState = {
	name: '' as string,
	editorEvent: null as StoryEvent | null,
	events: [
		makeStoryEvent({ name: 'First event name', timestamp: 0 }),
		makeStoryEvent({ name: 'Second event name', timestamp: 0 }),
	] as StoryEvent[],
}

export const worldSlice = createSlice({
	name: 'world',
	initialState,
	reducers: {
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},

		setEditorEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.editorEvent = payload
		},

		flushEditorEvent: (state) => {
			const editorEvent = state.editorEvent
			if (!editorEvent) {
				return
			}

			state.events = state.events.filter((event) => event.id !== editorEvent.id)
			state.events = state.events.concat(editorEvent)
			state.editorEvent = null
		},

		clearEditorEvent: (state) => {
			state.editorEvent = null
		},

		createEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.concat(payload)
		},

		updateEditorEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.editorEvent = payload
		},
	},
})

export type TimelineState = typeof initialState
// export const { createEvent, updateEvent } = worldSlice.actions;

export default worldSlice.reducer
