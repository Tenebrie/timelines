import { useLayoutEffect, useRef } from 'react'

import { useEventBusContext } from './EventBusProvider'
import { EventParams } from './types'

type SubscribeOpts<T> = [T] extends [void]
	? { condition?: () => boolean; callback: () => void }
	: { condition?: (params: T) => boolean; callback: (params: T) => void }

type UseSubscribe = {
	[K in keyof EventParams]: (opts: SubscribeOpts<EventParams[K]>) => void
}

export const useEventBusSubscribe = new Proxy({} as UseSubscribe, {
	get(_, event: keyof EventParams) {
		return (opts: SubscribeOpts<unknown>) => {
			const bus = useEventBusContext()
			const optsRef = useRef(opts)
			optsRef.current = opts

			useLayoutEffect(() => {
				const off = bus.on(event, (params) => {
					if (!optsRef.current.condition || optsRef.current.condition(params)) {
						optsRef.current.callback(params)
					}
				})
				return off
			}, [bus])
		}
	},
})
