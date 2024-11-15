import { GetWorldInfoApiResponse } from '../../api/worldApi'
import { WorldEvent } from '../features/world/types'
import { isNotNull } from './isNotNull'

export const ingestEvent = (rawEvent: GetWorldInfoApiResponse['events'][number]): WorldEvent => {
	return {
		...rawEvent,
		timestamp: Number(rawEvent.timestamp),
		revokedAt: isNotNull(rawEvent.revokedAt) ? Number(rawEvent.revokedAt) : undefined,
		deltaStates: rawEvent.deltaStates.map((delta) => ({
			...delta,
			timestamp: Number(delta.timestamp),
		})),
	}
}
