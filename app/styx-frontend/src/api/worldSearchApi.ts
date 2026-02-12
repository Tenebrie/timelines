import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldSearch', 'worldDetails', 'tagList'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			searchWorld: build.query<SearchWorldApiResponse, SearchWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/search/${queryArg.query}`,
					params: {
						mode: queryArg.mode,
					},
				}),
				providesTags: ['worldSearch', 'worldDetails', 'tagList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldSearchApi }
export type SearchWorldApiResponse = /** status 200  */ {
	actors: {
		pages: {
			id: string
			name: string
		}[]
		mentions: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
		node: null | {
			id: string
			createdAt: string
			updatedAt: string
			worldId: string
			parentActorId?: null | string
			positionX: number
			positionY: number
		}
		description: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
		title: string
		icon: string
		color: string
		descriptionRich: string
	}[]
	articles: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
		icon: string
		color: string
		contentRich: string
		position: number
		parentId?: null | string
	}[]
	events: {
		pages: {
			id: string
			name: string
		}[]
		mentions: {
			pageId?: null | string
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
			pageId?: null | string
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
			descriptionRich?: null | string
			timestamp: string
			worldEventId: string
		}[]
		description: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
		icon: string
		color: string
		descriptionRich: string
		type: 'SCENE' | 'OTHER'
		timestamp: string
		revokedAt?: null | string
		customName: boolean
		externalLink: string
		extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId?: null | string
	}[]
	tags: {
		description: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
	}[]
}
export type SearchWorldApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	query: string
	mode?: 'string_match' | 'split_by_space'
}
export const { useSearchWorldQuery, useLazySearchWorldQuery } = injectedRtkApi
