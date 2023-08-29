import { GetWorldInfoApiResponse } from '../../api/rheaApi'
import { WorldEvent } from '../features/world/types'

export const ingestEvent = (rawEvent: GetWorldInfoApiResponse['events'][number]): WorldEvent => {
	return {
		...rawEvent,
		timestamp: Number(rawEvent.timestamp),
		revokedAt: rawEvent.revokedAt ? Number(rawEvent.revokedAt) : undefined,
		deltaStates: rawEvent.deltaStates.map((delta) => ({
			...delta,
			timestamp: Number(delta.timestamp),
		})),
	}
}
