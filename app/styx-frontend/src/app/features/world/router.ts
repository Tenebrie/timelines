import { useDispatch } from 'react-redux'
import { NavigateOptions, useNavigate, useParams } from 'react-router-dom'

import { worldSlice } from './reducer'
import { MockedRouter } from './router.mock'

const useBaseRouter = <T extends string>(routes: Record<string, T>) => {
	const navigate = useNavigate()

	const navigateTo = (
		target: (typeof routes)[keyof typeof routes],
		args: Record<string, string>,
		navigateParams?: NavigateOptions
	) => {
		const replacedTarget = Object.keys(args).reduce(
			(total, current) => total.replace(`:${current}`, args[current]),
			target
		)
		navigate(replacedTarget, navigateParams)
	}

	return {
		navigateTo,
	}
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
		navigateTo(appRoutes.home, {})
	}

	const navigateToHomeWithoutHistory = async () => {
		navigateTo(appRoutes.home, {}, { replace: true })
	}

	const navigateToLogin = async () => {
		navigateTo(appRoutes.login, {})
	}

	const navigateToLoginWithoutHistory = async () => {
		navigateTo(appRoutes.login, {}, { replace: true })
	}

	const navigateToRegister = async () => {
		navigateTo(appRoutes.register, {})
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
	outliner: '/world/:worldId/outliner/:timestamp',
	eventEditor: '/world/:worldId/editor/:eventId',
	statementEditor: '/world/:worldId/statement/:statementId',
} as const

export type WorldRouteParamMapping = {
	[worldRoutes.root]: WorldRootParams
	[worldRoutes.outliner]: WorldOutlinerParams
	[worldRoutes.eventEditor]: WorldEventEditorParams
	[worldRoutes.statementEditor]: WorldStatementEditorParams
}
export type WorldRootParams = {
	worldId: string
}
export type WorldOutlinerParams = {
	worldId: string
	timestamp: string
}
export type WorldEventEditorParams = {
	worldId: string
	eventId: string
}
export type WorldStatementEditorParams = {
	worldId: string
	statementId: string
}

export const useWorldRouter = () => {
	const { navigateTo } = useBaseRouter(worldRoutes)
	const actualParams = useParams()
	const mockParams = MockedRouter.useParams()
	const state = MockedRouter.isEnabled ? mockParams : actualParams

	const { unloadWorld } = worldSlice.actions
	const dispatch = useDispatch()

	const worldParams = state as WorldRootParams
	const outlinerParams = state as WorldOutlinerParams
	const eventEditorParams = state as WorldEventEditorParams
	const statementEditorParams = state as WorldStatementEditorParams

	const navigateToWorld = async (id: string) => {
		dispatch(unloadWorld())
		navigateTo(worldRoutes.root, {
			worldId: id,
		})
	}

	const navigateToCurrentWorld = async () => {
		navigateTo(worldRoutes.root, {
			worldId: state['worldId'] || '',
		})
	}

	const navigateToOutliner = (timestamp: number) => {
		navigateTo(worldRoutes.outliner, {
			worldId: state['worldId'] || '',
			timestamp: String(timestamp),
		})
	}

	const navigateToEventEditor = (eventId: string) => {
		navigateTo(worldRoutes.eventEditor, {
			worldId: state['worldId'] || '',
			eventId,
		})
	}

	const navigateToStatementEditor = (statementId: string) => {
		navigateTo(worldRoutes.statementEditor, {
			worldId: state['worldId'] || '',
			statementId,
		})
	}

	return {
		worldParams,
		outlinerParams,
		eventEditorParams,
		statementEditorParams,
		navigateToWorld,
		navigateToCurrentWorld,
		navigateToOutliner,
		navigateToEventEditor,
		navigateToStatementEditor,
	}
}

export const allRoutes = {
	...appRoutes,
	...worldRoutes,
}
export type AllRouteParamMapping = AppRouteParamMapping & WorldRouteParamMapping
