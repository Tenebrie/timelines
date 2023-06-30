import { configureStore, PreloadedState } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import authReducer from './features/auth/reducer'
import spinnyReducer from './features/demo/spinny/reducer'
import preferencesReducer from './features/preferences/reducer'
import timelineReducer from './features/world/components/Timeline/reducer'
import worldReducer from './features/world/reducer'
import worldListReducer from './features/worldList/reducer'

export const generateStore = ({ preloadedState }: { preloadedState?: PreloadedState<any> } = {}) =>
	configureStore({
		reducer: {
			api: baseApi.reducer,
			auth: authReducer,
			spinny: spinnyReducer,
			world: worldReducer,
			worldList: worldListReducer,
			preferences: preferencesReducer,
			timeline: timelineReducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
		preloadedState,
	})

export const store = generateStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
