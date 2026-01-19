import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const TimelineZoomReporter = () => {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })

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
