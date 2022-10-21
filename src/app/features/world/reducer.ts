import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { makeStoryEvent } from './creators'
import { StoryEvent } from './types'

const initialState = {
	name: '' as string,
	events: [
		makeStoryEvent({ name: 'First event name', timestamp: 0 }),
		makeStoryEvent({ name: 'Second event name', timestamp: 0 }),
	] as StoryEvent[],

	outliner: {
		selectedTime: null as number | null,
	},

	eventEditor: {
		event: null as StoryEvent | null,
	},

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},
}

export const worldSlice = createSlice({
	name: 'world',
	initialState,
	reducers: {
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},

		/* Outliner */
		setSelectedOutlinerTime: (state, { payload }: PayloadAction<number | null>) => {
			state.outliner.selectedTime = payload
		},

		/* World events */
		createEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.events = state.events.concat(payload)
		},

		/* Event editor */
		setEditorEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.eventEditor.event = payload
		},

		updateEditorEvent: (state, { payload }: PayloadAction<StoryEvent>) => {
			state.eventEditor.event = payload
		},

		flushEditorEvent: (state) => {
			const editorEvent = state.eventEditor.event
			if (!editorEvent) {
				return
			}

			state.events = state.events.filter((event) => event.id !== editorEvent.id)
			state.events = state.events.concat(editorEvent)
			state.eventEditor.event = null
		},

		clearEditorEvent: (state) => {
			state.eventEditor.event = null
		},

		/* Event wizard */
		openEventWizard: (state, { payload }: PayloadAction<{ timestamp: number }>) => {
			state.eventWizard.isOpen = true
			state.eventWizard.timestamp = payload.timestamp
		},

		closeEventWizard: (state) => {
			state.eventWizard.isOpen = false
		},
	},
})

export type TimelineState = typeof initialState
export default worldSlice.reducer
