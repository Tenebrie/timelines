import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import authReducer from './features/auth/reducer'
import modalsReducer from './features/modals/reducer'
import preferencesReducer from './features/preferences/reducer'
import { deepMerge } from './utils/deepMerge'
import spinnyReducer from './views/spinny/reducer'
import { TimelineReducer } from './views/world/views/timeline/TimelineSlice'
import { WikiReducer } from './views/world/views/wiki/WikiSlice'
import { WorldReducer } from './views/world/WorldSlice'

const rootReducer = combineReducers({
	api: baseApi.reducer,
	auth: authReducer,
	modals: modalsReducer,
	spinny: spinnyReducer,
	world: WorldReducer,
	preferences: preferencesReducer,
	timeline: TimelineReducer,
	wiki: WikiReducer,
})

const initialState = configureStore({ reducer: rootReducer }).getState()

export const generateStore = ({ preloadedState }: { preloadedState?: Partial<RootState> } = {}) =>
	configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
		preloadedState: deepMerge(initialState, preloadedState ?? {}),
	})

export const store = generateStore()

export type RootState = typeof initialState
export type AppDispatch = typeof store.dispatch
