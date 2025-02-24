import { useEffect } from 'react'

import { AllowedEvents, EventParams } from './types'

type Props<T extends AllowedEvents> = {
	event?: T
	condition?: (params: EventParams[T]) => boolean
	callback: (params: EventParams[T]) => void
}

export const useEventBusSubscribe = <T extends AllowedEvents>({ event, condition, callback }: Props<T>) => {
	useEffect(() => {
		if (!event) {
			return
		}
		const onEvent = ((event: CustomEvent) => {
			const params = event.detail as EventParams[T]
			if (!condition || condition(params)) {
				callback(params)
			}
		}) as EventListener

		window.addEventListener(`@timelines/${event}`, onEvent)
		return () => {
			window.removeEventListener(`@timelines/${event}`, onEvent)
		}
	}, [callback, condition, event])
}
