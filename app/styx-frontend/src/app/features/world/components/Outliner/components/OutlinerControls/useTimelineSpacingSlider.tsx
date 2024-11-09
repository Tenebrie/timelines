import debounce from 'lodash.debounce'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '../../../../../preferences/reducer'
import { getTimelinePreferences } from '../../../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../../../time/hooks/useTimelineLevelScalar'
import { useTimelineBusDispatch } from '../../../../hooks/useTimelineBus'
import { TimelineState } from '../../../Timeline/utils/TimelineState'

type Props = {
	containerRef: React.MutableRefObject<HTMLDivElement | null>
}

export const useTimelineSpacingSlider = ({ containerRef }: Props) => {
	const { lineSpacing } = useSelector(getTimelinePreferences)
	const { setTimelineSpacing } = preferencesSlice.actions
	const { getLevelScalar } = useTimelineLevelScalar()
	const scrollTimelineTo = useTimelineBusDispatch()

	const [lineSpacingBuffer, setLineSpacingBuffer] = useState<number>(lineSpacing)
	const lineSpacingLastSeenAt = useRef(lineSpacing)

	const dispatch = useDispatch()

	useEffect(() => {
		setLineSpacingBuffer(lineSpacing)
	}, [lineSpacing])

	const setTimelineSpacingDebounced = useRef(
		debounce((value: number) => {
			dispatch(setTimelineSpacing(value))

			const scroll = TimelineState.scroll
			const containerCenter = Math.floor((containerRef.current?.getBoundingClientRect().width ?? 0) / 2)
			const flatScroll = (scroll - containerCenter) / (lineSpacingLastSeenAt.current / 10)
			lineSpacingLastSeenAt.current = value
			const target = Math.round((flatScroll * value) / 10) + containerCenter
			setTimeout(() => scrollTimelineTo(target, true, true), 1)
		}, 100),
	)

	const setValue = (value: number | number[]) => {
		if (typeof value !== 'number') {
			throw new Error('Range values not supported')
		}
		const valueSent = Math.round(value * 10 * 10) / 10
		setLineSpacingBuffer(valueSent)
		setTimelineSpacingDebounced.current(valueSent)
	}

	return {
		timelineSpacing: lineSpacingBuffer / 10,
		setTimelineSpacing: setValue,
	}
}
