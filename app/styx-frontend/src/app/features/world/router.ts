import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const useBaseRouter = <T extends string>(routes: Record<string, T>) => {
	const navigationTarget = useRef<string | null>(null)
	const [naviKey, setNaviKey] = useState<number>(0)

	const navigateTo = (target: (typeof routes)[keyof typeof routes], args: Record<string, string>) => {
		const replacedTarget = Object.keys(args).reduce(
			(total, current) => total.replace(`:${current}`, args[current]),
			target
		)
		if (navigationTarget.current !== replacedTarget) {
			navigationTarget.current = replacedTarget
			setNaviKey(naviKey + 1)
		}
	}

	const navigate = useNavigate()

	useEffect(() => {
		if (navigationTarget.current !== null) {
			navigate(navigationTarget.current)
			navigationTarget.current = null
		}
	}, [navigate, naviKey])

	return {
		navigateTo,
	}
}

export const appRoutes = {
	home: '/home',
	login: '/login',
	register: '/register',
}

export const useAppRouter = () => {
	const { navigateTo } = useBaseRouter(appRoutes)

	const navigateToHome = async () => {
		navigateTo(appRoutes.home, {})
	}

	const navigateToHomeWithoutHistory = async () => {
		window.location.replace(appRoutes.home)
	}

	const navigateToLogin = async () => {
		navigateTo(appRoutes.login, {})
	}

	const navigateToLoginWithoutHistory = async () => {
		window.location.replace(appRoutes.login)
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
} as const

export const useWorldRouter = () => {
	const { navigateTo } = useBaseRouter(worldRoutes)
	const state = useParams()

	const worldParams = state as {
		worldId: string
	}

	const outlinerParams = state as {
		worldId: string
		timestamp: string
	}

	const eventEditorParams = state as {
		worldId: string
		eventId: string
	}

	const navigateToWorld = async (id: string) => {
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

	return {
		worldParams,
		outlinerParams,
		eventEditorParams,
		navigateToWorld,
		navigateToCurrentWorld,
		navigateToOutliner,
		navigateToEventEditor,
	}
}
