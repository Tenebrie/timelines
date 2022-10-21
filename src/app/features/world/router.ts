import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { worldSlice } from './reducer'
import { StoryEvent } from './types'

export const worldRoutes = {
	outliner: '/outliner',
	eventEditor: '/editor',
}

export const useWorldRouter = () => {
	const dispatch = useDispatch()
	const { setSelectedOutlinerTime, setEditorEvent } = worldSlice.actions

	const navigate = useNavigate()

	const navigateToRoot = () => {
		navigate('/')
	}

	const navigateToOutliner = (timestamp: number) => {
		dispatch(setSelectedOutlinerTime(timestamp))
		navigate(worldRoutes.outliner)
	}

	const navigateToEventEditor = (event: StoryEvent) => {
		dispatch(setEditorEvent(event))
		navigate(worldRoutes.eventEditor)
	}

	return {
		navigateToRoot,
		navigateToOutliner,
		navigateToEventEditor,
	}
}
