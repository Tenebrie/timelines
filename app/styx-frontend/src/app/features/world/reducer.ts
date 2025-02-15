import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { GetWorldInfoApiResponse } from '@/api/worldDetailsApi'

import { ingestActor, ingestEvent } from '../../utils/ingestEvent'
import {
	ActorDetails,
	MarkerType,
	TimelineEntity,
	WorldAccessMode,
	WorldCalendarType,
	WorldEvent,
	WorldEventDelta,
} from '../worldTimeline/types'

export const initialState = {
	isLoaded: false as boolean,
	id: '' as string,
	name: '' as string,
	description: '' as string,
	events: [] as WorldEvent[],
	actors: [] as ActorDetails[],
	calendar: 'RIMWORLD' as WorldCalendarType,
	timeOrigin: '0',
	createdAt: '0',
	updatedAt: '0',
	selectedActors: [] as string[],
	selectedEvents: [] as string[],
	selectedTimelineMarkers: [] as { id: string; eventId: string }[],
	isReadOnly: false as boolean,
	accessMode: 'Private' as WorldAccessMode,

	search: {
		query: null as string | null,
		isLoading: false as boolean,
		results: {
			events: [] as WorldEvent[],
			actors: [] as ActorDetails[],
		},
	},

	eventCreator: {
		ghost: null as WorldEvent | null,
	},

	eventDeltaCreator: {
		ghost: null as WorldEventDelta | null,
	},

	timelineContextMenu: {
		isOpen: false as boolean,
		selectedTime: 0 as number,
		selectedEvent: null as TimelineEntity<MarkerType> | null,
		mousePos: { x: 0, y: 0 } as { x: number; y: number },
	},

	selectedTime: 0 as number,
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
		loadWorld: (state, { payload }: PayloadAction<{ world: GetWorldInfoApiResponse }>) => {
			const world = payload.world
			state.isLoaded = true
			state.id = world.id
			state.name = world.name
			state.description = world.description
			state.actors = [...world.actors].sort((a, b) => a.name.localeCompare(b.name)).map((a) => ingestActor(a))
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
		updateEventDelta: (
			state,
			{ payload }: PayloadAction<Pick<WorldEventDelta, 'id' | 'worldEventId'> & Partial<WorldEventDelta>>,
		) => {
			const event = state.events.find((e) => e.id === payload.worldEventId)
			if (!event) {
				return
			}
			const delta = event.deltaStates.find((d) => d.id === payload.id)
			if (!delta) {
				return
			}

			const newDelta = {
				...delta,
				...payload,
			}
			event.deltaStates.splice(event.deltaStates.indexOf(delta), 1, newDelta)
		},
		updateActor: (state, { payload }: PayloadAction<Pick<ActorDetails, 'id'> & Partial<ActorDetails>>) => {
			const actor = state.actors.find((e) => e.id === payload.id)
			if (!actor) {
				return
			}

			const newActor = {
				...actor,
				...payload,
			}
			state.actors.splice(state.actors.indexOf(actor), 1, newActor)
		},
		addEvent: (state, { payload }: PayloadAction<WorldEvent>) => {
			state.events = state.events.concat(payload)
		},
		addActor: (state, { payload }: PayloadAction<ActorDetails>) => {
			state.actors = state.actors.concat(payload).sort((a, b) => a.name.localeCompare(b.name))
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
		addTimelineMarkerToSelection: (
			state,
			{ payload }: PayloadAction<{ id: string; eventId: string; multiselect: boolean }>,
		) => {
			const record = { id: payload.id, eventId: payload.eventId }
			if (!payload.multiselect) {
				state.selectedTimelineMarkers = [record]
				return
			}

			if (state.selectedTimelineMarkers.some((m) => m.id === payload.id)) {
				return
			}
			state.selectedTimelineMarkers = [...state.selectedTimelineMarkers, record]
		},
		removeTimelineMarkerFromSelection: (state, { payload }: PayloadAction<string>) => {
			state.selectedTimelineMarkers = state.selectedTimelineMarkers.filter((marker) => marker.id !== payload)
		},
		clearSelections: (state) => {
			state.selectedActors = []
			state.selectedEvents = []
			state.selectedTimelineMarkers = []
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

		/* Search */
		setSearchLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.search.isLoading = payload
		},
		setSearchResults: (
			state,
			{ payload }: PayloadAction<{ query: string; results: (typeof initialState)['search']['results'] }>,
		) => {
			state.search.query = payload.query
			state.search.isLoading = false
			state.search.results = payload.results
		},
		cancelSearch: (state) => {
			state.search.query = null
			state.search.isLoading = false
		},

		/* Timeline context menu */
		openTimelineContextMenu: (
			state,
			{
				payload,
			}: PayloadAction<{
				selectedTime: number
				selectedEvent: TimelineEntity<MarkerType> | null
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

		/* Navigation state */
		setSelectedTime: (state, { payload }: PayloadAction<number>) => {
			state.selectedTime = payload
		},
	},
})

export type WorldState = typeof initialState
export const worldInitialState = initialState
export default worldSlice.reducer
