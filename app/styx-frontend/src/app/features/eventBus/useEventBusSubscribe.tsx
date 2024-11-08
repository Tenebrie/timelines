import { useCallback, useEffect } from 'react'

import { AllowedEvents, EventParams } from './types'

type Props<T extends AllowedEvents> = {
	event: T
	condition?: (params: EventParams[T]) => boolean
	callback: (params: EventParams[T]) => void
}

export const useEventBusSubscribe = <T extends AllowedEvents>({ event, condition, callback }: Props<T>) => {
	const onEvent = useCallback<EventListener>(
		// @ts-ignore
		(event: CustomEvent) => {
			const params = event.detail as EventParams[T]
			if (!condition || condition(params)) {
				callback(params)
			}
		},
		[callback, condition],
	)

	useEffect(() => {
		window.addEventListener(`@timeline/${event}`, onEvent)
		return () => {
			window.removeEventListener(`@timeline/${event}`, onEvent)
		}
	}, [event, onEvent])
}
