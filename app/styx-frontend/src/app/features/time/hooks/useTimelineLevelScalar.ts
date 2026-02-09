import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { LineSpacing } from '@/app/utils/constants'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useTimelineLevelScalar = () => {
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)

	// const spacingMod = 10 / LineSpacing
	const compression = 1
	const getLevelScalar = useCallback(
		(forLevel: ScaleLevel) => {
			const worldCalendar = calendars[0] ?? {
				presentations: [],
			}
			const presentation = worldCalendar?.presentations[Number(forLevel)] ?? {
				scaleFactor: 1,
			}
			console.log(presentation.scaleFactor)
			return (presentation.scaleFactor / LineSpacing) * compression
			// switch (forLevel) {
			// 	case -1:
			// 		return 0.1 * spacingMod
			// 	case 0:
			// 		return 1 * spacingMod
			// 	case 1:
			// 		return 6 * spacingMod
			// 	case 2:
			// 		return 36 * spacingMod
			// 	case 3:
			// 		return 144 * spacingMod
			// 	case 4:
			// 		return 4380 * spacingMod
			// 	case 5:
			// 		return 52560 * spacingMod
			// 	case 6:
			// 		return 262800 * spacingMod
			// 	case 7:
			// 		return 2628000 * spacingMod
			// }
		},
		[calendars],
	)

	return {
		getLevelScalar,
	}
}
