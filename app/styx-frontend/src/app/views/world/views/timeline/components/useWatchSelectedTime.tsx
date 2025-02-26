import { useSearch } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { worldSlice } from '@/app/views/world/WorldSlice'

export function useWatchSelectedTime() {
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
