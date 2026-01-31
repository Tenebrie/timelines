import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { Calendar } from './types'

export const initialState = {
	calendar: null as Calendar | null,
}

export const calendarEditorSlice = createSlice({
	name: 'calendarEditor',
	initialState,
	reducers: {
		setCalendar: (state, action: PayloadAction<Calendar | null>) => {
			state.calendar = action.payload
		},
	},
})

export type CalendarEditorState = typeof initialState
export const calendarEditorInitialState = initialState
export const CalendarEditorReducer = calendarEditorSlice.reducer
