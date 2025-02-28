import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { baseApi, BaseApiReducer } from '../api/base/baseApi'
import { AuthReducer } from './features/auth/AuthSlice'
import { ModalsReducer } from './features/modals/ModalsSlice'
import { PreferencesReducer } from './features/preferences/PreferencesSlice'
import { deepMerge } from './utils/deepMerge'
import { TimelineReducer } from './views/world/views/timeline/TimelineSlice'
import { WikiReducer } from './views/world/views/wiki/WikiSlice'
import { WorldReducer } from './views/world/WorldSlice'

const rootReducer = combineReducers({
	api: BaseApiReducer,
	auth: AuthReducer,
	modals: ModalsReducer,
	world: WorldReducer,
	preferences: PreferencesReducer,
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
