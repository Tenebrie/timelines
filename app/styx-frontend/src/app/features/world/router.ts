import { useDispatch } from 'react-redux'

import { useBaseRouter } from '../../../router/useBaseRouter'
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
	const { navigateTo } = useBaseRouter(appRoutes)

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

	return {
		navigateToHome,
		navigateToHomeWithoutHistory,
		navigateToLogin,
		navigateToLoginWithoutHistory,
		navigateToRegister,
	}
}

export const worldRoutes = {
	root: '/world/:worldId',
	outliner: '/world/:worldId/outliner',
	actorEditor: '/world/:worldId/actor/:actorId',
	eventEditor: '/world/:worldId/editor/:eventId',
	eventCreator: '/world/:worldId/editor/create',
} as const

export type WorldRouteParamMapping = {
	[worldRoutes.root]: WorldRootParams
	[worldRoutes.outliner]: WorldOutlinerParams
	[worldRoutes.actorEditor]: ActorEditorParams
	[worldRoutes.eventEditor]: WorldEventEditorParams
	[worldRoutes.eventCreator]: WorldEventCreatorParams
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
export type WorldEventEditorParams = {
	worldId: string
	eventId: string
}
export type WorldEventCreatorParams = {
	worldId: string
}

export const useWorldRouter = () => {
	const { state, navigateTo, query, setQuery } = useBaseRouter(worldRoutes)

	const { unloadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	const worldParams = state as WorldRootParams
	const outlinerParams = state as WorldOutlinerParams
	const actorEditorParams = state as ActorEditorParams
	const eventEditorParams = state as WorldEventEditorParams
	const eventCreatorParams = state as WorldEventCreatorParams

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
			{
				[QueryParams.SELECTED_TIME]: null,
			}
		)
	}

	const navigateToCurrentWorld = async ({ clearSelectedTime }: { clearSelectedTime?: boolean } = {}) => {
		navigateTo(
			worldRoutes.root,
			{
				worldId: state['worldId'] || '',
			},
			{
				[QueryParams.SELECTED_TIME]: clearSelectedTime ? null : undefined,
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
			{}
		)
	}

	const navigateToEventEditor = (eventId: string) => {
		navigateTo(
			worldRoutes.eventEditor,
			{
				worldId: state['worldId'] || '',
				eventId,
			},
			{}
		)
	}

	const navigateToEventCreator = () => {
		navigateTo(
			worldRoutes.eventCreator,
			{
				worldId: state['worldId'] || '',
			},
			{}
		)
	}

	const unselectTime = () => {
		setQuery(QueryParams.SELECTED_TIME, null)
	}

	return {
		worldParams,
		outlinerParams,
		actorEditorParams,
		eventEditorParams,
		eventCreatorParams,
		selectedTime,
		selectedTimeOrNull,
		navigateToWorld,
		navigateToCurrentWorld,
		navigateToOutliner,
		navigateToActorEditor,
		navigateToEventEditor,
		navigateToEventCreator,
		unselectTime,
	}
}

export const allRoutes = {
	...appRoutes,
	...worldRoutes,
}
export type AllRouteParamMapping = AppRouteParamMapping & WorldRouteParamMapping
