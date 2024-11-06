import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../../../preferences/selectors'

export const useContainerHeight = () => {
	const { containerHeight } = useSelector(getTimelinePreferences)
	return containerHeight
}
