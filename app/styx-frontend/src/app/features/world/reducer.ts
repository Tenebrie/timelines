import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { WorldDetails, WorldEvent, WorldEventBundle, WorldStatement } from './types'

const initialState = {
	id: '' as string,
	name: '' as string,
	events: [] as WorldEvent[],
	createdAt: '0',
	updatedAt: '0',

	hoveredEventMarkers: [] as (WorldEvent | WorldEventBundle)[],

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},

	eventEditor: {
		deleteEventModal: {
			isOpen: false as boolean,
			target: null as WorldEvent | null,
		},
		deleteStatementModal: {
			isOpen: false as boolean,
			target: null as WorldStatement | null,
		},
		issuedStatementWizard: {
			isOpen: false as boolean,
		},
		revokedStatementWizard: {
			isOpen: false as boolean,
		},
	},
}

export const worldSlice = createSlice({
	name: 'world',
	initialState,
	reducers: {
		setId: (state, { payload }: PayloadAction<string>) => {
			state.id = payload
		},
		setName: (state, { payload }: PayloadAction<string>) => {
			state.name = payload
		},
		loadWorld: (state, { payload }: PayloadAction<WorldDetails>) => {
			state.id = payload.id
			state.name = payload.name
			state.events = payload.events
			state.createdAt = payload.createdAt
			state.updatedAt = payload.updatedAt
		},

		hoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.concat(payload)
		},

		unhoverEventMarker: (state, { payload }: PayloadAction<WorldEvent | WorldEventBundle>) => {
			state.hoveredEventMarkers = state.hoveredEventMarkers.filter((marker) => marker.id !== payload.id)
		},

		/* Event wizard */
		openEventWizard: (state, { payload }: PayloadAction<{ timestamp: number }>) => {
			state.eventWizard.isOpen = true
			state.eventWizard.timestamp = payload.timestamp
		},

		closeEventWizard: (state) => {
			state.eventWizard.isOpen = false
		},

		/* Event editor - Delete event modal */
		openDeleteEventModal: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.eventEditor.deleteEventModal.isOpen = true
			state.eventEditor.deleteEventModal.target = payload
		},

		closeDeleteEventModal: (state) => {
			state.eventEditor.deleteEventModal.isOpen = false
		},

		/* Event editor - Delete statement modal */
		openDeleteStatementModal: (state, { payload }: PayloadAction<WorldStatement>) => {
			state.eventEditor.deleteStatementModal.isOpen = true
			state.eventEditor.deleteStatementModal.target = payload
		},

		closeDeleteStatementModal: (state) => {
			state.eventEditor.deleteStatementModal.isOpen = false
		},

		/* Event editor - Issued statement wizard */
		openIssuedStatementWizard: (state) => {
			state.eventEditor.issuedStatementWizard.isOpen = true
		},

		closeIssuedStatementWizard: (state) => {
			state.eventEditor.issuedStatementWizard.isOpen = false
		},

		/* Event editor - Revoked statement wizard */
		openRevokedStatementWizard: (state) => {
			state.eventEditor.revokedStatementWizard.isOpen = true
		},

		closeRevokedStatementWizard: (state) => {
			state.eventEditor.revokedStatementWizard.isOpen = false
		},
	},
})

export type TimelineState = typeof initialState
export default worldSlice.reducer
