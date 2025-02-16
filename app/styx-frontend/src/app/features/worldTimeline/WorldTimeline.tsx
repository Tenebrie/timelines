import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useSearch } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '../eventBus'
import { worldSlice } from '../world/reducer'
import { Outliner } from './components/Outliner/Outliner'
import { Timeline } from './components/Timeline/Timeline'
import { WorldStateWithDragger } from './components/WorldStateDrawer/WorldStateWithDragger'
import { WorldStateWithDraggerMirror } from './components/WorldStateDrawer/WorldStateWithDraggerMirror'

const useWatchSelectedTime = () => {
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const search = useSearch({
		from: '/world/$worldId/_world/timeline',
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
		// setTimeout(() => {
		// 	dispatch(setSelectedTime(selectedTime))
		// }, 0)
		dispatch(setSelectedTime(selectedTime))
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

	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<WorldStateWithDraggerMirror />
			<Box width={1} height={1} position="relative" overflow="auto">
				<Timeline />
				<Outliner />
			</Box>
			<WorldStateWithDragger />
		</Stack>
	)
}
