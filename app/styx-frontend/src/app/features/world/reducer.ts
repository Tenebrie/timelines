import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { GetWorldInfoApiResponse } from '../../../api/rheaApi'
import { ingestEvent } from '../../utils/ingestEvent'
import {
	ActorDetails,
	TimelineEntity,
	WorldAccessMode,
	WorldCalendarType,
	WorldEvent,
	WorldEventDelta,
} from './types'

export const initialState = {
	isLoaded: false as boolean,
	id: '' as string,
	name: '' as string,
	actors: [] as ActorDetails[],
	events: [] as WorldEvent[],
	calendar: 'RIMWORLD' as WorldCalendarType,
	timeOrigin: '0',
	createdAt: '0',
	updatedAt: '0',
	selectedActors: [] as string[],
	selectedEvents: [] as string[],
	isReadOnly: false as boolean,
	accessMode: 'Private' as WorldAccessMode,

	eventCreator: {
		ghost: null as WorldEvent | null,
	},

	eventDeltaCreator: {
		ghost: null as WorldEventDelta | null,
	},

	timelineContextMenu: {
		isOpen: false as boolean,
		selectedTime: 0 as number,
		selectedEvent: null as TimelineEntity | null,
		mousePos: { x: 0, y: 0 } as { x: number; y: number },
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
		loadWorld: (
			state,
			{ payload }: PayloadAction<{ world: GetWorldInfoApiResponse; actorColors: string[] }>,
		) => {
			const world = payload.world
			state.isLoaded = true
			state.id = world.id
			state.name = world.name
			state.actors = [...world.actors].sort(
				(a, b) =>
					payload.actorColors.indexOf(a.color) - payload.actorColors.indexOf(b.color) ||
					a.name.localeCompare(b.name),
			)
			state.events = world.events.map((e) => ingestEvent(e))
			state.calendar = world.calendar
			state.timeOrigin = world.timeOrigin
			state.createdAt = world.createdAt
			state.updatedAt = world.updatedAt
			state.isReadOnly = world.isReadOnly
			state.accessMode = world.accessMode
		},
		unloadWorld: (state) => {
			state.isLoaded = false
			state.events = []
			state.isReadOnly = false
		},
		updateEvent: (state, { payload }: PayloadAction<Pick<WorldEvent, 'id'> & Partial<WorldEvent>>) => {
			const event = state.events.find((e) => e.id === payload.id)
			if (!event) {
				return
			}

			const newEvent = {
				...event,
				...payload,
			}
			state.events.splice(state.events.indexOf(event), 1, newEvent)
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
		setIsReadOnly: (state, { payload }: PayloadAction<boolean>) => {
			state.isReadOnly = payload
		},

		/* Event creator */
		setEventCreatorGhost: (state, { payload }: PayloadAction<WorldEvent | null>) => {
			state.eventCreator.ghost = payload
		},
		setEventDeltaCreatorGhost: (state, { payload }: PayloadAction<WorldEventDelta | null>) => {
			state.eventDeltaCreator.ghost = payload
		},

		/* Timeline context menu */
		openTimelineContextMenu: (
			state,
			{
				payload,
			}: PayloadAction<{
				selectedTime: number
				selectedEvent: TimelineEntity | null
				mousePos: { x: number; y: number }
			}>,
		) => {
			state.timelineContextMenu.isOpen = true
			state.timelineContextMenu.selectedTime = payload.selectedTime
			state.timelineContextMenu.selectedEvent = payload.selectedEvent
			state.timelineContextMenu.mousePos = payload.mousePos
		},

		closeTimelineContextMenu: (state) => {
			state.timelineContextMenu.isOpen = false
		},
	},
})

export type WorldState = typeof initialState
export const worldInitialState = initialState
export default worldSlice.reducer
