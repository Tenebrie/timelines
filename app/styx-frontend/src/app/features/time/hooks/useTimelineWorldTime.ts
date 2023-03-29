import { ScaleLevel } from '../../world/components/Timeline/types'

type Props = {
	scaleLevel: ScaleLevel
}

export const useTimelineWorldTime = ({ scaleLevel }: Props) => {
	const getLevelScalar = (forLevel: ScaleLevel = scaleLevel) => {
		switch (forLevel) {
			case 'minute':
				return 1
			case 'hour':
				return 8
			case 'day':
				return 64
			case 'month':
				return 512
		}
	}

	const scalar = getLevelScalar(scaleLevel)

	const scaledTimeToRealTime = (time: number) => {
		return time * scalar
	}

	const realTimeToScaledTime = (time: number) => {
		return time / scalar
	}

	const getTimelineMultipliers = () => {
		if (scaleLevel === 'minute') {
			return {
				largeGroupSize: 48,
				mediumGroupSize: 12,
				smallGroupSize: 4,
			}
		} else {
			return {
				largeGroupSize: 48,
				mediumGroupSize: 12,
				smallGroupSize: 4,
			}
		}
	}

	return {
		getTimelineMultipliers,
		scaledTimeToRealTime,
		realTimeToScaledTime,
	}
}
