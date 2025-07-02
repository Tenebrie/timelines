import { WorldCalendarType } from '@api/types/worldTypes'
import { useCallback, useDebugValue, useMemo } from 'react'

import { ScaleLevel } from '@/app/schema/ScaleLevel'

import { useTimelineLevelScalar } from './useTimelineLevelScalar'

type Props = {
	scaleLevel: ScaleLevel
	calendar: WorldCalendarType
}

export const useTimelineWorldTime = ({ scaleLevel }: Props) => {
	useDebugValue('useTimelineWorldTime')
	const { getLevelScalar } = useTimelineLevelScalar()

	const scalar = useMemo<number>(() => getLevelScalar(scaleLevel), [getLevelScalar, scaleLevel])

	const scaledTimeToRealTime = useCallback(
		(time: number) => {
			return Math.round(time * scalar)
		},
		[scalar],
	)

	const realTimeToScaledTime = useCallback(
		(time: number) => {
			return Math.round(time / scalar)
		},
		[scalar],
	)

	const getTimelineMultipliers = useCallback(() => {
		if (scaleLevel === -1) {
			return {
				largeGroupSize: 1440,
				mediumGroupSize: 60,
				smallGroupSize: 10,
			}
		} else if (scaleLevel === 0) {
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
		} else if (scaleLevel === 3) {
			// Note: See TimelineAnchorLine for custom logic
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: Infinity,
				smallGroupSize: Infinity,
			}
		} else if (scaleLevel === 4) {
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: 120,
				smallGroupSize: 12,
			}
		} else if (scaleLevel === 5) {
			return {
				largeGroupSize: 1000,
				mediumGroupSize: 100,
				smallGroupSize: 10,
			}
		} else if (scaleLevel === 6) {
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: 100,
				smallGroupSize: 20,
			}
		} else if (scaleLevel === 7) {
			return {
				largeGroupSize: Infinity,
				mediumGroupSize: 100,
				smallGroupSize: 20,
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
