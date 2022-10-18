import { configureStore } from '@reduxjs/toolkit'

import worldSlice from './features/world/reducer'

export const store = configureStore({
	reducer: {
		world: worldSlice,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
