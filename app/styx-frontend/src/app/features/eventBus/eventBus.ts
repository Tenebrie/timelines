import { AllowedEvents, EventParams } from './types'

type Listener<T> = (payload: T) => void

class EventBus {
	#map = new Map<AllowedEvents, Set<Listener<unknown>>>()

	on<T extends AllowedEvents>(event: T, fn: Listener<EventParams[T]>) {
		const set = this.#map.get(event) ?? new Set()
		set.add(fn as Listener<unknown>)
		this.#map.set(event, set)
		return () => this.off(event, fn)
	}

	off<T extends AllowedEvents>(event: T, fn: Listener<EventParams[T]>) {
		this.#map.get(event)?.delete(fn as Listener<unknown>)
	}

	emit<T extends AllowedEvents>(event: T, payload: EventParams[T]) {
		this.#map.get(event)?.forEach((fn) => fn(payload))
	}
}

export const eventBus = new EventBus()
