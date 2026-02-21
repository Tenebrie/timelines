import { useCallback } from 'react'

import { globalEventBus } from './eventBus'
import { useEventBusContext } from './EventBusProvider'
import { AllowedEvents, EventParams } from './types'

type DispatchFn<T> = [T] extends [void] ? () => void : (params: T) => void

type Dispatch = {
	[K in keyof EventParams]: DispatchFn<EventParams[K]>
}

type UseDispatch = {
	[K in keyof EventParams]: () => DispatchFn<EventParams[K]>
}

export const dispatchGlobalEvent = new Proxy({} as Dispatch, {
	get(_, event: AllowedEvents) {
		return (params: unknown) => globalEventBus.emit(event, params as EventParams[typeof event])
	},
})

export const useEventBusDispatch = new Proxy({} as UseDispatch, {
	get(_, event: AllowedEvents) {
		return () => {
			const bus = useEventBusContext()
			return useCallback(
				(params: unknown) => bus.emit(event as AllowedEvents, params as EventParams[typeof event]),
				[bus],
			)
		}
	},
})
