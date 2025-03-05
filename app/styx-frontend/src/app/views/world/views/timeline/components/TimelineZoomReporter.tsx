import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

export const TimelineZoomReporter = () => {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	useEffect(() => {
		navigate({
			search: (prev) => ({
				...prev,
				scale: scaleLevel,
			}),
		})
	}, [navigate, scaleLevel])

	return null
}
