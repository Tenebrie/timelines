import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { worldSlice } from './reducer'
import { StoryEvent } from './types'

const useBaseRouter = <T extends string>(routes: Record<string, T>) => {
	const [navigationTarget, setNavigationTarget] = useState<string | null>(null)

	const navigateTo = (target: typeof routes[keyof typeof routes]) => {
		if (navigationTarget !== target) {
			setNavigationTarget(target)
		}
	}

	const navigate = useNavigate()

	useEffect(() => {
		if (navigationTarget !== null) {
			navigate(navigationTarget)
			setNavigationTarget(null)
		}
	}, [navigate, navigationTarget])

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
		navigateTo(appRoutes.home)
	}

	const navigateToLogin = async () => {
		navigateTo(appRoutes.login)
	}

	const navigateToRegister = async () => {
		navigateTo(appRoutes.register)
	}

	return {
		navigateToHome,
		navigateToLogin,
		navigateToRegister,
	}
}

export const worldRoutes = {
	home: '/',
	root: '/world',
	outliner: '/world/outliner',
	eventEditor: '/world/editor',
} as const

export const useWorldRouter = () => {
	const { navigateTo } = useBaseRouter(worldRoutes)

	const dispatch = useDispatch()
	const { setId, setSelectedOutlinerTime, setEditorEvent, clearEditorEvent } = worldSlice.actions

	const navigateToWorldRoot = async (id: string) => {
		dispatch(setId(id))
		navigateTo(worldRoutes.root)
	}

	const navigateToCurrentWorldRoot = async () => {
		navigateTo(worldRoutes.root)
		dispatch(clearEditorEvent())
		dispatch(setSelectedOutlinerTime(null))
	}

	const navigateToOutliner = (timestamp: number) => {
		dispatch(setSelectedOutlinerTime(timestamp))
		navigateTo(worldRoutes.outliner)
		dispatch(clearEditorEvent())
	}

	const navigateToEventEditor = (event: StoryEvent) => {
		dispatch(setEditorEvent(event))
		navigateTo(worldRoutes.eventEditor)
		dispatch(setSelectedOutlinerTime(null))
	}

	return {
		navigateToWorldRoot,
		navigateToCurrentWorldRoot,
		navigateToOutliner,
		navigateToEventEditor,
	}
}
