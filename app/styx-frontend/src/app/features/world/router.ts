import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { QueryStrategy, useBaseRouter } from '../../../router/useBaseRouter'
import { worldSlice } from './reducer'

export enum QueryParams {
	SELECTED_TIME = 'time',
}

export const appRoutes = {
	limbo: '/',
	home: '/home',
	login: '/login',
	register: '/register',
} as const

export type AppRouteParamMapping = {
	[appRoutes.limbo]: undefined
	[appRoutes.home]: undefined
	[appRoutes.login]: undefined
	[appRoutes.register]: undefined
}

export const useAppRouter = () => {
	const { navigateTo, isLocationEqual: isBaseLocationEqual } = useBaseRouter(appRoutes)

	const navigateToHome = async () => {
		navigateTo(
			appRoutes.home,
			{},
			{
				[QueryParams.SELECTED_TIME]: null,
			}
		)
	}

	const navigateToHomeWithoutHistory = async () => {
		navigateTo(appRoutes.home, {}, {}, { replace: true })
	}

	const navigateToLogin = async () => {
		navigateTo(appRoutes.login, {}, {})
	}

	const navigateToLoginWithoutHistory = async () => {
		navigateTo(appRoutes.login, {}, {}, { replace: true })
	}

	const navigateToRegister = async () => {
		navigateTo(appRoutes.register, {}, {})
	}

	const isLocationEqual = useCallback(
		(route: keyof WorldRouteParamMapping) => {
			return isBaseLocationEqual(route)
		},
		[isBaseLocationEqual]
	)

	return {
		navigateToHome,
		navigateToHomeWithoutHistory,
		navigateToLogin,
		navigateToLoginWithoutHistory,
		navigateToRegister,
		isLocationEqual,
	}
}

export const worldRoutes = {
	root: '/world/:worldId',
	outliner: '/world/:worldId/outliner',
	actorEditor: '/world/:worldId/actor/:actorId',
	eventCreator: '/world/:worldId/editor/create',
	eventEditor: '/world/:worldId/editor/:eventId',
	eventDeltaCreator: '/world/:worldId/editor/:eventId/delta/create',
	eventDeltaEditor: '/world/:worldId/editor/:eventId/delta/:deltaId',
} as const

export type WorldRouteParamMapping = {
	[worldRoutes.root]: WorldRootParams
	[worldRoutes.outliner]: WorldOutlinerParams
	[worldRoutes.actorEditor]: ActorEditorParams
	[worldRoutes.eventCreator]: WorldEventCreatorParams
	[worldRoutes.eventEditor]: WorldEventEditorParams
	[worldRoutes.eventDeltaCreator]: WorldEventDeltaCreatorParams
	[worldRoutes.eventDeltaEditor]: WorldEventDeltaEditorParams
}
export type WorldRootParams = {
	worldId: string
}
export type WorldOutlinerParams = {
	worldId: string
	timestamp: string
}
export type ActorEditorParams = {
	worldId: string
	actorId: string
}
export type WorldEventCreatorParams = {
	worldId: string
}
export type WorldEventEditorParams = {
	worldId: string
	eventId: string
}
export type WorldEventDeltaCreatorParams = {
	worldId: string
	eventId: string
}
export type WorldEventDeltaEditorParams = {
	worldId: string
	eventId: string
	deltaId: string
}

export const useWorldRouter = () => {
	const {
		state,
		navigateTo,
		query,
		setQuery,
		isLocationEqual: isBaseLocationEqual,
	} = useBaseRouter(worldRoutes)

	const { unloadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	const worldParams = state as WorldRootParams
	const outlinerParams = state as WorldOutlinerParams
	const actorEditorParams = state as ActorEditorParams
	const eventCreatorParams = state as WorldEventCreatorParams
	const eventEditorParams = state as WorldEventEditorParams
	const eventDeltaCreatorParams = state as WorldEventDeltaCreatorParams
	const eventDeltaEditorParams = state as WorldEventDeltaEditorParams

	const selectedTime = Number(query.get(QueryParams.SELECTED_TIME) || '0')
	const selectedTimeOrNull = query.get(QueryParams.SELECTED_TIME)
		? Number(query.get(QueryParams.SELECTED_TIME))
		: null

	const navigateToWorld = async (id: string) => {
		dispatch(unloadWorld())
		navigateTo(
			worldRoutes.root,
			{
				worldId: id,
			},
			{}
		)
	}

	const navigateToCurrentWorld = async ({ clearSelectedTime }: { clearSelectedTime?: boolean } = {}) => {
		navigateTo(
			worldRoutes.root,
			{
				worldId: state['worldId'] || '',
			},
			{
				[QueryParams.SELECTED_TIME]: clearSelectedTime ? QueryStrategy.Clear : QueryStrategy.Preserve,
			}
		)
	}

	const navigateToOutliner = (timestamp: number) => {
		navigateTo(
			worldRoutes.outliner,
			{
				worldId: state['worldId'] || '',
			},
			{
				[QueryParams.SELECTED_TIME]: String(timestamp),
			}
		)
	}

	const navigateToActorEditor = (actorId: string) => {
		navigateTo(
			worldRoutes.actorEditor,
			{
				worldId: state['worldId'] || '',
				actorId,
			},
			{
				[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
			}
		)
	}

	const navigateToEventCreator = ({ selectedTime }: { selectedTime?: number } = {}) => {
		navigateTo(
			worldRoutes.eventCreator,
			{
				worldId: state['worldId'] || '',
			},
			{
				[QueryParams.SELECTED_TIME]:
					selectedTime === undefined ? QueryStrategy.Preserve : String(selectedTime),
			}
		)
	}

	const navigateToEventEditor = (eventId: string) => {
		navigateTo(
			worldRoutes.eventEditor,
			{
				worldId: state['worldId'] || '',
				eventId,
			},
			{
				[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
			}
		)
	}

	const navigateToEventDeltaCreator = ({
		eventId,
		selectedTime,
	}: {
		eventId: string
		selectedTime?: number
	}) => {
		navigateTo(
			worldRoutes.eventDeltaCreator,
			{
				worldId: state['worldId'] || '',
				eventId,
			},
			{
				[QueryParams.SELECTED_TIME]:
					selectedTime === undefined ? QueryStrategy.Preserve : String(selectedTime),
			}
		)
	}

	const navigateToEventDeltaEditor = ({
		eventId,
		deltaId,
		selectedTime,
	}: {
		eventId: string
		deltaId: string
		selectedTime?: number
	}) => {
		navigateTo(
			worldRoutes.eventDeltaEditor,
			{
				worldId: state['worldId'] || '',
				eventId,
				deltaId,
			},
			{
				[QueryParams.SELECTED_TIME]:
					selectedTime === undefined ? QueryStrategy.Preserve : String(selectedTime),
			}
		)
	}

	const selectTime = (time: number) => {
		setQuery(QueryParams.SELECTED_TIME, String(time))
	}

	const unselectTime = () => {
		setQuery(QueryParams.SELECTED_TIME, null)
	}

	const isLocationEqual = useCallback(
		(route: keyof WorldRouteParamMapping) => {
			return isBaseLocationEqual(route)
		},
		[isBaseLocationEqual]
	)

	return {
		worldParams,
		outlinerParams,
		actorEditorParams,
		eventCreatorParams,
		eventEditorParams,
		eventDeltaCreatorParams,
		eventDeltaEditorParams,
		selectedTime,
		selectedTimeOrNull,
		navigateToWorld,
		navigateToCurrentWorld,
		navigateToOutliner,
		navigateToActorEditor,
		navigateToEventCreator,
		navigateToEventEditor,
		navigateToEventDeltaCreator,
		navigateToEventDeltaEditor,
		selectTime,
		unselectTime,
		isLocationEqual,
		query: {
			selectedTime,
			selectedTimeOrNull,
		},
	}
}

export const allRoutes = {
	...appRoutes,
	...worldRoutes,
}
export type AllRouteParamMapping = AppRouteParamMapping & WorldRouteParamMapping
