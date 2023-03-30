import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	worldWizardModal: {
		isOpen: false as boolean,
	},
	deleteWorldModal: {
		isOpen: false as boolean,
		worldId: '' as string,
		worldName: '' as string,
	},
}

export const worldListSlice = createSlice({
	name: 'worldList',
	initialState,
	reducers: {
		/* World wizard modal */
		openWorldWizardModal: (state) => {
			state.worldWizardModal.isOpen = true
		},

		closeWorldWizardModal: (state) => {
			state.worldWizardModal.isOpen = false
		},

		/* Delete world modal */
		openDeleteWorldModal: (state, { payload }: PayloadAction<{ id: string; name: string }>) => {
			state.deleteWorldModal.isOpen = true
			state.deleteWorldModal.worldId = payload.id
			state.deleteWorldModal.worldName = payload.name
		},

		closeDeleteWorldModal: (state) => {
			state.deleteWorldModal.isOpen = false
		},
	},
})

export type WorldListState = typeof initialState
export default worldListSlice.reducer
