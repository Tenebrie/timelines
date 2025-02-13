import Stack from '@mui/material/Stack'
import { Outlet, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useLocationRef } from '@/app/hooks/useLocationRef'

import { useEventBusDispatch } from '../eventBus'
import { worldSlice } from '../world/reducer'
import { Timeline } from './components/Timeline/Timeline'
import { WorldContent } from './styles'

const useWatchSelectedTime = () => {
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const search = useSearch({
		from: '/world/$worldId/_world/timeline/_timeline',
		select: (search) => ({
			time: search.time,
		}),
	})

	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	/**
	 * Selected time has changed for any reason
	 */
	useEffect(() => {
		const selectedTime = search.time
		setTimeout(() => {
			dispatch(setSelectedTime(selectedTime))
		}, 0)
	}, [dispatch, setSelectedTime, scrollTimelineTo, search.time])

	/**
	 * User has pushed the back button
	 */
	const onPopstate = useCallback(() => {
		const url = new URL(window.location.href)
		const value = url.searchParams.get('time' satisfies keyof typeof search)
		if (value) {
			const selectedTime = parseInt(value)
			scrollTimelineTo({ timestamp: selectedTime })
		}
	}, [scrollTimelineTo])

	useEffect(() => {
		window.addEventListener('popstate', onPopstate)
		return () => {
			window.removeEventListener('popstate', onPopstate)
		}
	}, [onPopstate])
}

export const WorldTimeline = () => {
	useWatchSelectedTime()

	const { nodeRef } = useLocationRef()

	return (
		<>
			{/* <SwitchTransition> */}
			{/* <CSSTransition key={key} timeout={300} classNames="fade" mountOnEnter unmountOnExit nodeRef={nodeRef}> */}
			<WorldContent ref={nodeRef}>
				<Timeline />
				<Stack
					sx={{ position: 'absolute', width: '100%', zIndex: 2, top: 0, pointerEvents: 'none' }}
					justifyContent="center"
					alignItems="center"
				>
					<Stack sx={{ width: '100%', maxWidth: '1800px', pointerEvents: 'auto' }}>
						<Outlet />
					</Stack>
				</Stack>
			</WorldContent>
			{/* </CSSTransition> */}
			{/* </SwitchTransition> */}
		</>
	)
}
