import { baseApi as api } from './base/baseApi'
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
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
			id: string
			createdAt: string
			updatedAt: string
			name?: null | string
			timestamp: string
			descriptionRich?: null | string
			worldEventId: string
		}[]
		worldId: string
		description: string
		id: string
		createdAt: string
		updatedAt: string
		type: 'SCENE' | 'OTHER'
		icon: string
		color: string
		name: string
		timestamp: string
		revokedAt?: null | string
		descriptionRich: string
		descriptionYjs?: null | string
		customName: boolean
		externalLink: string
		extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId?: null | string
	}[]
	actors: {
		mentions: {
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		worldId: string
		description: string
		id: string
		createdAt: string
		updatedAt: string
		icon: string
		color: string
		name: string
		descriptionRich: string
		descriptionYjs?: null | string
		title: string
	}[]
	articles: {
		mentions: {
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
			sourceId: string
			targetId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceActorId?: null | string
			sourceEventId?: null | string
			sourceArticleId?: null | string
			sourceTagId?: null | string
			targetActorId?: null | string
			targetEventId?: null | string
			targetArticleId?: null | string
			targetTagId?: null | string
		}[]
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		icon: string
		color: string
		name: string
		contentRich: string
		contentYjs?: null | string
		position: number
		parentId?: null | string
	}[]
}
export type SearchWorldApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	query: string
}
export const { useSearchWorldQuery, useLazySearchWorldQuery } = injectedRtkApi
