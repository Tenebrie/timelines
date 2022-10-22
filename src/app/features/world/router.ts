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

export const worldRoutes = {
	root: '/',
	outliner: '/outliner',
	eventEditor: '/editor',
} as const

export const useWorldRouter = () => {
	const { navigateTo } = useBaseRouter(worldRoutes)

	const dispatch = useDispatch()
	const { setSelectedOutlinerTime, setEditorEvent } = worldSlice.actions

	const navigateToRoot = () => {
		navigateTo('/')
	}

	const navigateToOutliner = (timestamp: number) => {
		dispatch(setSelectedOutlinerTime(timestamp))
		navigateTo(worldRoutes.outliner)
	}

	const navigateToEventEditor = (event: StoryEvent) => {
		dispatch(setEditorEvent(event))
		navigateTo(worldRoutes.eventEditor)
	}

	return {
		navigateToRoot,
		navigateToOutliner,
		navigateToEventEditor,
	}
}
