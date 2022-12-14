import { configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import preferencesReducer from './features/preferences/reducer'
import worldReducer from './features/world/reducer'

export const store = configureStore({
	reducer: {
		api: baseApi.reducer,
		world: worldReducer,
		preferences: preferencesReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
