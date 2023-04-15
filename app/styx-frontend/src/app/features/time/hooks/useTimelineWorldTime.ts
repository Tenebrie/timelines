import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ScaleLevel } from '../../world/components/Timeline/types'
import { getWorldState } from '../../world/selectors'
import { useTimelineLevelScalar } from './useTimelineLevelScalar'
import { useWorldCalendar } from './useWorldCalendar'

type Props = {
	scaleLevel: ScaleLevel
}

export const useTimelineWorldTime = ({ scaleLevel }: Props) => {
	const { calendar } = useSelector(getWorldState)
	const { getCalendar } = useWorldCalendar()
	const calendarDefinition = getCalendar(calendar).definition

	const { getLevelScalar } = useTimelineLevelScalar()

	const scalar = useMemo<number>(() => getLevelScalar(scaleLevel), [getLevelScalar, scaleLevel])

	const scaledTimeToRealTime = useCallback(
		(time: number) => {
			return time * scalar
		},
		[scalar]
	)

	const realTimeToScaledTime = useCallback(
		(time: number) => {
			return time / scalar
		},
		[scalar]
	)

	const getTimelineMultipliers = useCallback(() => {
		if (scaleLevel === 0) {
			return {
				largeGroupSize: 144,
				mediumGroupSize: 36,
				smallGroupSize: 6,
			}
		} else if (scaleLevel === 1) {
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: 24,
				smallGroupSize: 6,
			}
		} else if (scaleLevel === 2) {
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: Infinity,
				smallGroupSize: 4,
			}
		}
		return {
			largeGroupSize: Infinity,
			mediumGroupSize: Infinity,
			smallGroupSize: Infinity,
		}
	}, [scaleLevel])

	return {
		getTimelineMultipliers,
		scaledTimeToRealTime,
		realTimeToScaledTime,
	}
}
