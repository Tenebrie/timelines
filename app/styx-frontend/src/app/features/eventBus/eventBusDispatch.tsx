import { useCallback } from 'react'

import { eventBus } from './eventBus'
import { AllowedEvents, EventParams } from './types'

type DispatchFn<T> = [T] extends [void] ? () => void : (params: T) => void

type Dispatch = {
	[K in keyof EventParams]: DispatchFn<EventParams[K]>
}

type UseDispatch = {
	[K in keyof EventParams]: () => DispatchFn<EventParams[K]>
}

export const dispatchEvent = new Proxy({} as Dispatch, {
	get(_, event: AllowedEvents) {
		return (params: unknown) => eventBus.emit(event, params as EventParams[typeof event])
	},
})

export const useEventBusDispatch = new Proxy({} as UseDispatch, {
	get(_, event: AllowedEvents) {
		return () =>
			useCallback(
				(params: unknown) => eventBus.emit(event as AllowedEvents, params as EventParams[typeof event]),
				[],
			)
	},
})
