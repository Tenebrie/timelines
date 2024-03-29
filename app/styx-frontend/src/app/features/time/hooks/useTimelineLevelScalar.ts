import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../preferences/selectors'
import { ScaleLevel } from '../../world/components/Timeline/types'

export const useTimelineLevelScalar = () => {
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const spacingMod = 10 / lineSpacing
	const getLevelScalar = useCallback(
		(forLevel: ScaleLevel) => {
			switch (forLevel) {
				case 0:
					return 1 * spacingMod
				case 1:
					return 6 * spacingMod
				case 2:
					return 36 * spacingMod
				case 3:
					return 144 * spacingMod
			}
		},
		[spacingMod]
	)

	return {
		getLevelScalar,
	}
}
