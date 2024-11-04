import { useCallback } from 'react'

import { AllowedEvents, EventParams } from './types'

type Props<T extends AllowedEvents> = {
	event: T
}

export const useEventBusDispatch = <T extends AllowedEvents>({ event }: Props<T>) => {
	return useCallback(
		(params: EventParams[T]) => {
			window.dispatchEvent(
				new CustomEvent(`@timeline/${event}`, {
					detail: params,
				}),
			)
		},
		[event],
	)
}
