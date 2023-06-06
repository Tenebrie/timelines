import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { CreateAccountApiResponse } from '../../../api/rheaApi'

export type User = CreateAccountApiResponse

export const initialState = {
	user: null as User | null,
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
	},
})

export type AuthState = typeof initialState
export default authSlice.reducer
