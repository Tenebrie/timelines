import { ScaleLevel } from '../../world/components/Timeline/types'
import { useWorldTime } from './useWorldTime'

type Props = {
	scaleLevel: ScaleLevel
}

export const useTimelineWorldTime = ({ scaleLevel }: Props) => {
	const { daysInYear, hoursInDay, minutesInHour } = useWorldTime()

	const getLevelScalar = (forLevel: ScaleLevel = scaleLevel) => {
		switch (forLevel) {
			case 0:
				return 1
			case 1:
				return 8
			case 2:
				return 64
			case 3:
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
		return {
			largeGroupSize: 48,
			mediumGroupSize: 12,
			smallGroupSize: 4,
		}
	}

	return {
		getTimelineMultipliers,
		scaledTimeToRealTime,
		realTimeToScaledTime,
	}
}
