import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	colors: false,
	multiSpinny: false,
	extraSpinny: false,
}

export const spinnySlice = createSlice({
	name: 'spinny',
	initialState,
	reducers: {
		setColors: (state, { payload }: PayloadAction<boolean>) => {
			state.colors = payload
		},
		setMultiSpinny: (state, { payload }: PayloadAction<boolean>) => {
			state.multiSpinny = payload
		},
		setExtraSpinny: (state, { payload }: PayloadAction<boolean>) => {
			state.extraSpinny = payload
		},
	},
})

export type SpinnyState = typeof initialState
export default spinnySlice.reducer
