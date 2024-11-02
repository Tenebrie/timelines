import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../preferences/selectors'

export const useContainerHeight = () => {
	const { containerHeight } = useSelector(getTimelinePreferences)
	const safeHeight = useMemo(() => {
		if (containerHeight < 150) {
			return 150
		}
		if (containerHeight > 800) {
			return 800
		}
		return containerHeight
	}, [containerHeight])

	return safeHeight
}
