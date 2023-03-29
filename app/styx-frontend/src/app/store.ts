import { configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import preferencesReducer from './features/preferences/reducer'
import spinnyReducer from './features/spinny/reducer'
import worldReducer from './features/world/reducer'

export const store = configureStore({
	reducer: {
		api: baseApi.reducer,
		spinny: spinnyReducer,
		world: worldReducer,
		preferences: preferencesReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
