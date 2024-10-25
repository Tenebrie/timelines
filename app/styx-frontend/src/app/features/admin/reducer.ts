import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { User } from '../auth/reducer'

export const initialState = {
	deleteUserModal: {
		isOpen: false as boolean,
		targetUser: null as User | null,
	},
}

export const adminSlice = createSlice({
	name: 'admin',
	initialState,
	reducers: {
		/* Delete user modal */
		openDeleteUserModal: (state, { payload }: PayloadAction<User>) => {
			state.deleteUserModal.isOpen = true
			state.deleteUserModal.targetUser = payload
		},

		closeDeleteUserModal: (state) => {
			state.deleteUserModal.isOpen = false
			state.deleteUserModal.targetUser = null
		},
	},
})

export type AdminState = typeof initialState
export const adminInitialState = initialState
export default adminSlice.reducer
