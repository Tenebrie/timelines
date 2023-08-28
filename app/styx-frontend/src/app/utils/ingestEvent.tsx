import { GetWorldInfoApiResponse } from '../../api/rheaApi'
import { WorldEvent } from '../features/world/types'

export const ingestEvent = (rawEvent: GetWorldInfoApiResponse['events'][number]): WorldEvent => {
	return {
		...rawEvent,
		timestamp: Number(rawEvent.timestamp),
		revokedAt: rawEvent.revokedAt ? Number(rawEvent.revokedAt) : undefined,
		replaces: rawEvent.replaces ? ingestNestedEvent(rawEvent.replaces) : null,
		replacedBy: rawEvent.replacedBy ? ingestNestedEvent(rawEvent.replacedBy) : null,
	}
}

export const ingestNestedEvent = (rawEvent: GetWorldInfoApiResponse['events'][number]['replaces']) => {
	if (rawEvent === null) {
		return null
	}
	return {
		...rawEvent,
		timestamp: Number(rawEvent.timestamp),
	}
}
