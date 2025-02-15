import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { timelineSlice } from '@/app/features/worldTimeline/components/Timeline/reducer'

import useEventTracks from '../hooks/useEventTracks'

export const TimelineTrackManager = () => {
	const tracks = useEventTracks()

	const { setTracks } = timelineSlice.actions
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setTracks(tracks))
	}, [dispatch, setTracks, tracks])

	return null
}
