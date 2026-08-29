import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export const TimelineZoomReporter = () => {
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const isRouteMatch = useCheckRouteMatch('/world/$worldId/timeline')
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })

	// TODO: Scale level changes to history
	// TODO: Do not push the same scale level multiple times (first load bug)
	// TODO: Delete when selected marker is revoke to unrevoke instead of delete event
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
