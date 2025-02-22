import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { timelineSlice } from '@/app/features/worldTimeline/components/Timeline/reducer'

import useEventTracks from '../hooks/useEventTracks'

export const TimelineTrackManager = () => {
	const data = useEventTracks()

	const { setTracks } = timelineSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setTracks(data))
	}, [data, dispatch, setTracks])

	return null
}
