import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { CreateAccountApiResponse } from '@/api/authApi'

export type User = CreateAccountApiResponse

export const initialState = {
	user: null as User | null,
	showRheaConnectionAlert: false as boolean,
	showCalliopeConnectionAlert: false as boolean,
}

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, { payload }: PayloadAction<User>) => {
			state.user = payload
		},
		clearUser: (state) => {
			state.user = null
		},
		showRheaConnectionAlert: (state) => {
			state.showRheaConnectionAlert = true
		},
		hideRheaConnectionAlert: (state) => {
			state.showRheaConnectionAlert = false
		},
		showCalliopeConnectionAlert: (state) => {
			state.showCalliopeConnectionAlert = true
		},
		hideCalliopeConnectionAlert: (state) => {
			state.showCalliopeConnectionAlert = false
		},
	},
})

export type AuthState = typeof initialState
export const authInitialState = initialState
export default authSlice.reducer
