import { CalendarDraft, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
	calendar: null as CalendarDraft | null,
}

export const calendarEditorSlice = createSlice({
	name: 'calendarEditor',
	initialState,
	reducers: {
		setCalendarDraft: (state, action: PayloadAction<CalendarDraft | null>) => {
			state.calendar = action.payload
		},
		updateUnitChildren: (
			state,
			action: PayloadAction<{ unitId: string; children: CalendarDraftUnitChildRelation[] }>,
		) => {
			if (!state.calendar) return
			const unit = state.calendar.units.find((u) => u.id === action.payload.unitId)
			if (unit) {
				unit.children = action.payload.children
			}
		},
	},
})

export type CalendarEditorState = typeof initialState
export const calendarEditorInitialState = initialState
export const CalendarEditorReducer = calendarEditorSlice.reducer
