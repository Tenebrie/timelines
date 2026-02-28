import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { timelineSlice } from '@/app/views/world/views/timeline/TimelineSlice'

import useEventTracks from '../../hooks/useEventTracks'

export const TimelineTrackReporter = () => {
	const data = useEventTracks()

	const { setTracks } = timelineSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setTracks(data))
	}, [data, dispatch, setTracks])

	return null
}
