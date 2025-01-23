import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useOutlet } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { useLocationRef } from '@/hooks/useLocationRef'
import {
	useWorldTimelineRouter,
	worldTimelineRoutes,
} from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'

import { worldSlice } from '../world/reducer'
import { useTimelineBusDispatch } from './hooks/useTimelineBus'
import { WorldContent } from './styles'

const useWatchSelectedTime = () => {
	const { queryOf } = useWorldTimelineRouter()

	const scrollTimelineTo = useTimelineBusDispatch()

	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	/**
	 * Selected time has been changed externally
	 */
	useEffect(() => {
		const value = queryOf(worldTimelineRoutes.timelineRoot).time
		const selectedTime = parseInt(value)
		dispatch(setSelectedTime(selectedTime))
		scrollTimelineTo(selectedTime)
	}, [dispatch, setSelectedTime, scrollTimelineTo, queryOf])

	/**
	 * User has pushed the back button
	 */
	const onPopstate = useCallback(() => {
		const url = new URL(window.location.href)
		const value = url.searchParams.get(QueryParams.SELECTED_TIME)
		if (value) {
			const selectedTime = parseInt(value)
			dispatch(setSelectedTime(selectedTime))
			scrollTimelineTo(selectedTime)
		}
	}, [dispatch, scrollTimelineTo, setSelectedTime])

	useEffect(() => {
		window.addEventListener('popstate', onPopstate)
		return () => {
			window.removeEventListener('popstate', onPopstate)
		}
	}, [onPopstate])
}

export const WorldTimeline = () => {
	useWatchSelectedTime()

	const currentOutlet = useOutlet()
	const { key, nodeRef } = useLocationRef()

	return (
		<>
			<SwitchTransition>
				<CSSTransition key={key} timeout={300} classNames="fade" unmountOnExit nodeRef={nodeRef}>
					<WorldContent ref={nodeRef}>{currentOutlet}</WorldContent>
				</CSSTransition>
			</SwitchTransition>
		</>
	)
}
