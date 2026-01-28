import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const TimelineZoomReporter = () => {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const isRouteMatch = useCheckRouteMatch('/world/$worldId/timeline')
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })

	useEffect(() => {
		if (!isRouteMatch) {
			return
		}
		navigate({
			search: (prev) => ({
				...prev,
				scale: scaleLevel,
			}),
		})
	}, [isRouteMatch, navigate, scaleLevel])

	return null
}
