import { configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import spinnyReducer from './features/demo/spinny/reducer'
import preferencesReducer from './features/preferences/reducer'
import worldReducer from './features/world/reducer'
import worldListReducer from './features/worldList/reducer'

export const generateStore = () =>
	configureStore({
		reducer: {
			api: baseApi.reducer,
			spinny: spinnyReducer,
			world: worldReducer,
			worldList: worldListReducer,
			preferences: preferencesReducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
	})

export const store = generateStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
