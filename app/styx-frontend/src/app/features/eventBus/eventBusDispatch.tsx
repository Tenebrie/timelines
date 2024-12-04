import { useCallback } from 'react'

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
	window.dispatchEvent(
		new CustomEvent(`@timelines/${event}`, {
			detail: params,
		}),
	)
}

export const useEventBusDispatch = <T extends AllowedEvents>({ event }: Props<T>) => {
	return useCallback(
		(params: EventParams[T]) => {
			dispatchEvent({ event, params })
		},
		[event],
	)
}
