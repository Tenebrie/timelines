import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ScaleLevel } from './components/Timeline/types'
import { Actor, WorldCalendarType, WorldDetails, WorldEvent, WorldStatement } from './types'

export const initialState = {
	isLoaded: false as boolean,
	id: '' as string,
	name: '' as string,
	actors: [] as Actor[],
	events: [] as WorldEvent[],
	calendar: 'COUNTUP' as WorldCalendarType,
	timeOrigin: '0',
	createdAt: '0',
	updatedAt: '0',

	actorWizard: {
		isOpen: false as boolean,
	},

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},

	outliner: {
		eventTutorialModal: {
			isOpen: false as boolean,
		},
	},

	actorEditor: {
		deleteActorModal: {
			isOpen: false as boolean,
			target: null as Actor | null,
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
			mode: 'create' as 'create' | 'replace',
			scope: 'world' as 'world' | 'actor',
		},
		revokedStatementWizard: {
			isOpen: false as boolean,
		},
		issuedActorStatementWizard: {
			isOpen: false as boolean,
			actor: null as Actor | null,
		},
	},

	timeline: {
		scaleLevel: 0 as ScaleLevel,
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
			state.actors = payload.actors
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
			state.events = []
		},

		/* Actor wizard */
		openActorWizard: (state) => {
			state.actorWizard.isOpen = true
		},

		closeActorWizard: (state) => {
			state.actorWizard.isOpen = false
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

		/* Actor editor - Delete actor modal */
		openDeleteActorModal: (state, { payload }: PayloadAction<Actor>) => {
			state.actorEditor.deleteActorModal.isOpen = true
			state.actorEditor.deleteActorModal.target = payload
		},

		closeDeleteActorModal: (state) => {
			state.actorEditor.deleteActorModal.isOpen = false
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
		openIssuedStatementWizard: (
			state,
			{
				payload,
			}: PayloadAction<{
				mode: WorldState['eventEditor']['issuedStatementWizard']['mode']
				scope: WorldState['eventEditor']['issuedStatementWizard']['scope']
			}>
		) => {
			state.eventEditor.issuedStatementWizard.isOpen = true
			state.eventEditor.issuedStatementWizard.mode = payload.mode
			state.eventEditor.issuedStatementWizard.scope = payload.scope
		},

		closeIssuedStatementWizard: (state) => {
			state.eventEditor.issuedStatementWizard.isOpen = false
		},

		/* Event editor - Revoked world statement wizard */
		openRevokedStatementWizard: (state) => {
			state.eventEditor.revokedStatementWizard.isOpen = true
		},

		closeRevokedStatementWizard: (state) => {
			state.eventEditor.revokedStatementWizard.isOpen = false
		},

		/* Event editor - Issued actor statement wizard */
		openIssuedActorStatementWizard: (state) => {
			state.eventEditor.issuedActorStatementWizard.isOpen = true
		},

		closeIssuedActorStatementWizard: (state) => {
			state.eventEditor.issuedActorStatementWizard.isOpen = false
		},

		/* Timeline */
		setTimelineScaleLevel: (state, { payload }: PayloadAction<ScaleLevel>) => {
			state.timeline.scaleLevel = payload
		},
	},
})

export type WorldState = typeof initialState
export default worldSlice.reducer
