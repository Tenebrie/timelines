import { baseApi as api } from './baseApi'
export const addTagTypes = ['worldSearch', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			searchWorld: build.query<SearchWorldApiResponse, SearchWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/search/${queryArg.query}` }),
				providesTags: ['worldSearch', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldSearchApi }
export type SearchWorldApiResponse = /** status 200  */ {
	events: {
		mentions: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		mentionedIn: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		deltaStates: {
			description?: null | string
			name?: null | string
			id: string
			createdAt: string
			updatedAt: string
			timestamp: string
			descriptionRich?: null | string
			worldEventId: string
		}[]
		description: string
		type: 'SCENE' | 'OTHER'
		name: string
		id: string
		createdAt: string
		updatedAt: string
		worldId: string
		timestamp: string
		icon: string
		revokedAt?: null | string
		descriptionRich: string
		customName: boolean
		externalLink: string
		extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId?: null | string
	}[]
	actors: {
		mentions: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		mentionedIn: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		description: string
		name: string
		id: string
		createdAt: string
		updatedAt: string
		title: string
		color: string
		worldId: string
	}[]
}
export type SearchWorldApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	query: string
}
export const { useSearchWorldQuery, useLazySearchWorldQuery } = injectedRtkApi
