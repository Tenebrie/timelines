import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { WorldCalendarType, WorldDetails, WorldEvent, WorldStatement } from './types'

export const initialState = {
	isLoaded: false as boolean,
	id: '' as string,
	name: '' as string,
	events: [] as WorldEvent[],
	calendar: 'COUNTUP' as WorldCalendarType,
	timeOrigin: '0',
	createdAt: '0',
	updatedAt: '0',

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},

	outliner: {
		eventTutorialModal: {
			isOpen: false as boolean,
		},
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
			state.isLoaded = true
			state.id = payload.id
			state.name = payload.name
			state.events = payload.events.map((e) => ({
				...e,
				timestamp: Number(e.timestamp),
			}))
			state.calendar = payload.calendar
			state.timeOrigin = payload.timeOrigin
			state.createdAt = payload.createdAt
			state.updatedAt = payload.updatedAt
		},
		unloadWorld: (state) => {
			state.isLoaded = false
		},

		/* Event wizard */
		openEventWizard: (state, { payload }: PayloadAction<{ timestamp: number }>) => {
			state.eventWizard.isOpen = true
			state.eventWizard.timestamp = payload.timestamp
		},

		closeEventWizard: (state) => {
			state.eventWizard.isOpen = false
		},

		/* Outliner - Event tutorial modal */
		openEventTutorialModal: (state) => {
			state.outliner.eventTutorialModal.isOpen = true
		},

		closeEventTutorialModal: (state) => {
			state.outliner.eventTutorialModal.isOpen = false
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
