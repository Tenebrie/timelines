import { useCallback } from 'react'

import { parseTimeSelector } from '../utils/parseTimeSelector'
import { useWorldTime } from './useWorldTime'

export const useTimeSelector = ({ rawTime }: { rawTime: number }) => {
	const { parseTime, pickerToTimestamp } = useWorldTime()
	const applySelector = useCallback(
		(selector: string) => {
			const parsedSelector = parseTimeSelector(selector)
			const currentTime = parseTime(rawTime)
			const timestamp = pickerToTimestamp({
				year: parsedSelector.toYear ?? currentTime.year + parsedSelector.deltaYears,
				monthIndex: parsedSelector.toMonth ?? currentTime.monthIndex + parsedSelector.deltaMonths,
				day: parsedSelector.toDay ?? currentTime.day + parsedSelector.deltaDays - 1,
				hour: parsedSelector.toHour ?? currentTime.hour + parsedSelector.deltaHours,
				minute: parsedSelector.toMinute ?? currentTime.minute + parsedSelector.deltaMinutes,
			})
			return {
				timestamp,
			}
		},
		[parseTime, pickerToTimestamp, rawTime],
	)

	return {
		applySelector,
	}
}
