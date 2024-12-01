import { useSelector } from 'react-redux'

import { getWorldState } from '../app/features/worldTimeline/selectors'

export const useIsReadOnly = () => {
	const { isReadOnly } = useSelector(getWorldState, (a, b) => a.isReadOnly === b.isReadOnly)
	return { isReadOnly }
}
