import { useCallback } from 'react'

import { eventBus } from './eventBus'
import { AllowedEvents, EventParams } from './types'

type Props<T extends AllowedEvents> = {
	event: T
}

export const dispatchEvent = <T extends AllowedEvents>({
	event,
	params,
}: {
	event: T
	params: EventParams[T]
}) => {
	eventBus.emit(event, params)
}

export const useEventBusDispatch = <T extends AllowedEvents>({ event }: Props<T>) => {
	return useCallback(
		(params: EventParams[T]) => {
			dispatchEvent({ event, params })
		},
		[event],
	)
}
