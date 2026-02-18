import { useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	setOpacity: (value: number) => void
}

export function TimelinePrePositioner({ setOpacity }: Props) {
	const selectedTime = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => search.time,
	})
	const { isLoaded } = useSelector(
		getWorldState,
		(a, b) => a.timeOrigin === b.timeOrigin && a.isLoaded === b.isLoaded,
	)
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	const isShown = useRef(false)
	useEffect(() => {
		if (isShown.current || !isLoaded) {
			return
		}
		isShown.current = true
		scrollTimelineTo({
			timestamp: selectedTime,
			skipAnim: true,
		})
		requestIdleCallback(() => {
			setOpacity(1)
		})
	}, [isLoaded, scrollTimelineTo, selectedTime, setOpacity])

	return null
}
