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
		mentionedIn: {
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
		node: null | {
			worldId: string
			id: string
			createdAt: string
			updatedAt: string
			parentActorId?: null | string
			positionX: number
			positionY: number
		}
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		title: string
		icon: string
		color: string
		description: string
		descriptionRich: string
	}[]
	articles: {
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
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
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
		mentionedIn: {
			sourceId: string
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
		deltaStates: {
			id: string
			createdAt: string
			updatedAt: string
			name?: null | string
			description?: null | string
			descriptionRich?: null | string
			timestamp: string
			worldEventId: string
		}[]
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		icon: string
		color: string
		description: string
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
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
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
