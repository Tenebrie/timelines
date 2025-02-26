import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '@/app/features/preferences/selectors'

export const useContainerHeight = () => {
	const { containerHeight } = useSelector(getTimelinePreferences)
	return containerHeight
}
