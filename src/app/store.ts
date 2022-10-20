import { configureStore } from '@reduxjs/toolkit'

import preferencesReducer from './features/preferences/reducer'
import worldReducer from './features/world/reducer'

export const store = configureStore({
	reducer: {
		world: worldReducer,
		preferences: preferencesReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
