import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '../../preferences/selectors'
import { ScaleLevel } from '../../world/components/Timeline/types'

export const useTimelineLevelScalar = () => {
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const spacingMod = useMemo(() => 10 / lineSpacing, [lineSpacing])
	const getLevelScalar = useCallback(
		(forLevel: ScaleLevel) => {
			switch (forLevel) {
				case -1:
					return 0.1 * spacingMod
				case 0:
					return 1 * spacingMod
				case 1:
					return 6 * spacingMod
				case 2:
					return 36 * spacingMod
				case 3:
					return 144 * spacingMod
				case 4:
					return 4380 * spacingMod
				case 5:
					return 52560 * spacingMod
				case 6:
					return 262800 * spacingMod
				case 7:
					return 2628000 * spacingMod
			}
		},
		[spacingMod],
	)

	return {
		getLevelScalar,
	}
}
