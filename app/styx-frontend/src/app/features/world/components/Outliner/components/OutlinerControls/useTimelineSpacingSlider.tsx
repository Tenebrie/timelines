import debounce from 'lodash.debounce'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PreferencesInitialState, preferencesSlice } from '../../../../../preferences/reducer'
import { getTimelinePreferences } from '../../../../../preferences/selectors'

export const useTimelineSpacingSlider = () => {
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { setTimelineSpacing } = preferencesSlice.actions

	const defaultSpacing = PreferencesInitialState.timeline.lineSpacing

	const [lineSpacingBuffer, setLineSpacingBuffer] = useState<number>(lineSpacing)

	const dispatch = useDispatch()

	useEffect(() => {
		setLineSpacingBuffer(lineSpacing)
	}, [lineSpacing])

	const setTimelineSpacingDebounced = useRef(
		debounce((value: number) => {
			dispatch(setTimelineSpacing(value))
		})
	)

	const setValue = (value: number | number[]) => {
		if (typeof value !== 'number') {
			throw new Error('Range values not supported')
		}
		setLineSpacingBuffer(value * defaultSpacing)
		setTimelineSpacingDebounced.current(value * defaultSpacing)
	}

	return {
		timelineSpacing: lineSpacingBuffer / defaultSpacing,
		setTimelineSpacing: setValue,
	}
}
