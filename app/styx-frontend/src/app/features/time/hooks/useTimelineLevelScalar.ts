import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '@/app/schema/ScaleLevel'
import { LineSpacing } from '@/app/utils/constants'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useTimelineLevelScalar = () => {
	const { calendars } = useSelector(getWorldState, (a, b) => a.calendars === b.calendars)

	// const spacingMod = 10 / LineSpacing
	const getLevelScalar = useCallback(
		(forLevel: ScaleLevel) => {
			const worldCalendar = calendars[0] ?? {
				presentations: [],
			}
			const presentation = worldCalendar?.presentations[Number(forLevel + 1)] ?? {
				scaleFactor: 1,
			}
			return presentation.scaleFactor / LineSpacing
		},
		[calendars],
	)

	return {
		getLevelScalar,
	}
}
