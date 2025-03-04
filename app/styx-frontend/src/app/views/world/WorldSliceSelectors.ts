import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getWorldStateLoaded = createSelector([getWorldState], (state) => state.isLoaded)
export const getWorldIdState = createSelector([getWorldState], (state) => state.id)
export const getWorldCalendarState = createSelector([getWorldState], (state) => state.calendar)
export const getWorldRouterState = createSelector([getWorldState], (state) => ({
	id: state.id,
	isReadOnly: state.isReadOnly,
}))
export const getEventCreatorState = (state: RootState) => state.world.eventCreator
export const getEventDeltaCreatorState = (state: RootState) => state.world.eventDeltaCreator
export const getTimelineContextMenuState = (state: RootState) => state.world.timelineContextMenu
export const getTimelineState = (state: RootState) => state.timeline
