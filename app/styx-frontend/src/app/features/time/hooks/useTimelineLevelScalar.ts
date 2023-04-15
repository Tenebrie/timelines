import { useCallback } from 'react'

import { ScaleLevel } from '../../world/components/Timeline/types'

export const useTimelineLevelScalar = () => {
	const getLevelScalar = useCallback((forLevel: ScaleLevel) => {
		switch (forLevel) {
			case 0:
				return 1
			case 1:
				return 6
			case 2:
				return 36
			case 3:
				return 144
		}
	}, [])

	return {
		getLevelScalar,
	}
}
