import { configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../api/baseApi'
import spinnyReducer from './features/demo/spinny/reducer'
import preferencesReducer from './features/preferences/reducer'
import worldReducer from './features/world/reducer'
import worldListReducer from './features/worldList/reducer'

export const store = configureStore({
	reducer: {
		api: baseApi.reducer,
		spinny: spinnyReducer,
		world: worldReducer,
		worldList: worldListReducer,
		preferences: preferencesReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
