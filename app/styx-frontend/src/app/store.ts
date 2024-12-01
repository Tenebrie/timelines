import { configureStore, PreloadedState } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import adminReducer from './features/admin/reducer'
import authReducer from './features/auth/reducer'
import spinnyReducer from './features/demo/spinny/reducer'
import modalsReducer from './features/modals/reducer'
import preferencesReducer from './features/preferences/reducer'
import worldListReducer from './features/worldList/reducer'
import timelineReducer from './features/worldTimeline/components/Timeline/reducer'
import worldReducer from './features/worldTimeline/reducer'

export const generateStore = ({ preloadedState }: { preloadedState?: PreloadedState<object> } = {}) =>
	configureStore({
		reducer: {
			api: baseApi.reducer,
			admin: adminReducer,
			auth: authReducer,
			modals: modalsReducer,
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
