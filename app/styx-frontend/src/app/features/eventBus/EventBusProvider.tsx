import { createContext, ReactNode, use, useRef } from 'react'

import { EventBus, globalEventBus } from './eventBus'

const EventBusContext = createContext<EventBus>(globalEventBus)

export function useEventBusContext(): EventBus {
	return use(EventBusContext)
}

type Props = {
	bus?: EventBus
	children: ReactNode
}

/**
 * Provides an EventBus instance to the component tree.
 * By default uses the global singleton. Pass a custom `bus` to isolate events.
 */
export function EventBusProvider({ bus, children }: Props) {
	const busRef = useRef(bus ?? new EventBus())
	return <EventBusContext value={busRef.current}>{children}</EventBusContext>
}
