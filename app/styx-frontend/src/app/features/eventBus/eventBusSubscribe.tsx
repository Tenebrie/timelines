import { useEffect } from 'react'

import { eventBus } from './eventBus'
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

		const off = eventBus.on(event, (params) => {
			if (!condition || condition(params)) {
				callback(params)
			}
		})
		return off
	}, [callback, condition, event])
}
