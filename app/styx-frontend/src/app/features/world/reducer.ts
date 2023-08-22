import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ActorDetails, WorldCalendarType, WorldDetails, WorldEvent, WorldEventOnTimeline } from './types'

export const initialState = {
	isLoaded: false as boolean,
	id: '' as string,
	name: '' as string,
	actors: [] as ActorDetails[],
	events: [] as WorldEvent[],
	calendar: 'COUNTUP' as WorldCalendarType,
	timeOrigin: '0',
	createdAt: '0',
	updatedAt: '0',
	selectedActors: [] as string[],
	selectedEvents: [] as string[],

	eventCreator: {
		ghostEvent: null as WorldEvent | null,
	},

	actorWizard: {
		isOpen: false as boolean,
	},

	eventWizard: {
		isOpen: false as boolean,
		timestamp: 0 as number,
	},

	timelineContextMenu: {
		isOpen: false as boolean,
		selectedTime: 0 as number,
		selectedEvent: null as WorldEventOnTimeline | null,
		mousePos: { x: 0, y: 0 } as { x: number; y: number },
	},

	outliner: {
		eventTutorialModal: {
			isOpen: false as boolean,
		},
	},

	actorEditor: {
		deleteActorModal: {
			isOpen: false as boolean,
			target: null as ActorDetails | null,
		},
	},

	eventEditor: {
		deleteEventModal: {
			isOpen: false as boolean,
			target: null as WorldEvent | null,
		},
		revokedStatementWizard: {
			isOpen: false as boolean,
			preselectedEventId: '' as string,
		},
		issuedActorStatementWizard: {
			isOpen: false as boolean,
			actor: null as ActorDetails | null,
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
		loadWorld: (state, { payload }: PayloadAction<{ world: WorldDetails; actorColors: string[] }>) => {
			const world = payload.world
			state.isLoaded = true
			state.id = world.id
			state.name = world.name
			state.actors = [...world.actors].sort(
				(a, b) =>
					payload.actorColors.indexOf(a.color) - payload.actorColors.indexOf(b.color) ||
					a.name.localeCompare(b.name)
			)
			state.events = world.events.map((e) => ({
				...e,
				timestamp: Number(e.timestamp),
				revokedAt: e.revokedAt ? Number(e.revokedAt) : undefined,
			}))
			state.calendar = world.calendar
			state.timeOrigin = world.timeOrigin
			state.createdAt = world.createdAt
			state.updatedAt = world.updatedAt
		},
		unloadWorld: (state) => {
			state.isLoaded = false
			state.events = []
		},
		addActorToSelection: (state, { payload }: PayloadAction<{ id: string; multiselect: boolean }>) => {
			if (!payload.multiselect) {
				state.selectedEvents = []
				state.selectedActors = [payload.id]
				return
			}

			if (state.selectedActors.includes(payload.id)) {
				return
			}
			state.selectedActors = [...state.selectedActors, payload.id]
		},
		removeActorFromSelection: (state, { payload }: PayloadAction<string>) => {
			state.selectedActors = state.selectedActors.filter((event) => event !== payload)
		},
		addEventToSelection: (state, { payload }: PayloadAction<{ id: string; multiselect: boolean }>) => {
			if (!payload.multiselect) {
				state.selectedActors = []
				state.selectedEvents = [payload.id]
				return
			}

			if (state.selectedEvents.includes(payload.id)) {
				return
			}
			state.selectedEvents = [...state.selectedEvents, payload.id]
		},
		removeEventFromSelection: (state, { payload }: PayloadAction<string>) => {
			state.selectedEvents = state.selectedEvents.filter((event) => event !== payload)
		},
		clearSelections: (state) => {
			state.selectedActors = []
			state.selectedEvents = []
		},

		/* Event creator */
		setEventCreatorGhostEvent: (state, { payload }: PayloadAction<WorldEvent | null>) => {
			state.eventCreator.ghostEvent = payload
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

		/* Timeline context menu */
		openTimelineContextMenu: (
			state,
			{
				payload,
			}: PayloadAction<{
				selectedTime: number
				selectedEvent: WorldEventOnTimeline | null
				mousePos: { x: number; y: number }
			}>
		) => {
			state.timelineContextMenu.isOpen = true
			state.timelineContextMenu.selectedTime = payload.selectedTime
			state.timelineContextMenu.selectedEvent = payload.selectedEvent
			state.timelineContextMenu.mousePos = payload.mousePos
		},

		closeTimelineContextMenu: (state) => {
			state.timelineContextMenu.isOpen = false
		},

		/* Outliner - Event tutorial modal */
		openEventTutorialModal: (state) => {
			state.outliner.eventTutorialModal.isOpen = true
		},

		closeEventTutorialModal: (state) => {
			state.outliner.eventTutorialModal.isOpen = false
		},

		/* Actor editor - Delete actor modal */
		openDeleteActorModal: (state, { payload }: PayloadAction<ActorDetails>) => {
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

		/* Event editor - Revoked world statement wizard */
		openRevokedStatementWizard: (state, { payload }: PayloadAction<{ preselectedEventId: string }>) => {
			state.eventEditor.revokedStatementWizard.isOpen = true
			state.eventEditor.revokedStatementWizard.preselectedEventId = payload.preselectedEventId
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
	},
})

export type WorldState = typeof initialState
export const worldInitialState = initialState
export default worldSlice.reducer
