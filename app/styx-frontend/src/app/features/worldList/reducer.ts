import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	worldWizardModal: {
		isOpen: false as boolean,
	},
	shareWorldModal: {
		isOpen: false as boolean,
		worldId: '' as string,
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

		/* Share world modal */
		openShareWorldModal: (state, { payload }: PayloadAction<{ id: string }>) => {
			state.shareWorldModal.isOpen = true
			state.shareWorldModal.worldId = payload.id
		},

		closeShareWorldModal: (state) => {
			state.shareWorldModal.isOpen = false
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
export const worldListInitialState = initialState
export default worldListSlice.reducer
