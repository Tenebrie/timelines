import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import adminReducer from './features/admin/reducer'
import authReducer from './features/auth/reducer'
import spinnyReducer from './features/demo/spinny/reducer'
import modalsReducer from './features/modals/reducer'
import preferencesReducer from './features/preferences/reducer'
import worldReducer from './features/world/reducer'
import worldListReducer from './features/worldList/reducer'
import timelineReducer from './features/worldTimeline/components/Timeline/reducer'
import wikiReducer from './features/worldWiki/reducer'
import { deepMerge } from './utils/deepMerge'

const rootReducer = combineReducers({
	api: baseApi.reducer,
	admin: adminReducer,
	auth: authReducer,
	modals: modalsReducer,
	spinny: spinnyReducer,
	world: worldReducer,
	worldList: worldListReducer,
	preferences: preferencesReducer,
	timeline: timelineReducer,
	wiki: wikiReducer,
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
