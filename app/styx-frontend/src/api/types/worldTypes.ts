import { GetWorldsApiResponse } from '@api/worldListApi'

import { GetWorldBriefApiResponse, GetWorldInfoApiResponse } from '@/api/worldDetailsApi'

export type FullMentionDetails = GetWorldInfoApiResponse['actors'][number]['mentions'][number]
export type MentionedEntity = GetWorldInfoApiResponse['actors'][number]['mentions'][number]['sourceType']
export type MentionDetails = Pick<FullMentionDetails, 'targetId' | 'targetType'>
export type Actor = Omit<ActorDetails, 'statements'>
export type ActorDetails = GetWorldInfoApiResponse['actors'][number]
export type WorldItem = GetWorldsApiResponse['ownedWorlds'][number]
export type WorldBrief = GetWorldBriefApiResponse
export type WorldDetails = Omit<GetWorldInfoApiResponse, 'events'> & {
	events: WorldEvent[]
}
export type WorldEvent = Omit<
	GetWorldInfoApiResponse['events'][number],
	'timestamp' | 'revokedAt' | 'deltaStates'
> & {
	timestamp: number
	revokedAt?: number
	deltaStates: (Omit<GetWorldInfoApiResponse['events'][number]['deltaStates'][number], 'timestamp'> & {
		timestamp: number
	})[]
}
export type WorldEventDelta = WorldEvent['deltaStates'][number]
export type WorldCalendarType = WorldDetails['calendar']

export type MarkerType = 'issuedAt' | 'deltaState' | 'revokedAt' | 'ghostEvent' | 'ghostDelta'
/**
 * id: ID of the object this marker represents
 * 	- issuedAt: ID of the event
 *  - revokedAt: ID of the event
 *  - deltaState: ID of the delta
 * eventId: Always ID of the corresponding event
 * key: Unique ID of the marker
 *  - (e.g. `1111-revoked`)
 */
export type TimelineEntity<T extends MarkerType> = WorldEvent & {
	eventId: string
	key: string
	markerPosition: number
	markerType: T
	markerHeight: number
	baseEntity: T extends 'issuedAt'
		? WorldEvent
		: T extends 'revokedAt'
			? WorldEvent
			: T extends 'deltaState'
				? WorldEventDelta
				: null
	chainEntity: TimelineEntity<MarkerType> | null
	followingEntity: TimelineEntity<MarkerType> | null
}

export type WorldEventModule = WorldEvent['extraFields'][number]
export type WorldAccessMode = WorldBrief['accessMode']
