import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldSearch', 'worldDetails', 'worldTag'] as const
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
				providesTags: ['worldSearch', 'worldDetails', 'worldTag'],
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
			id: string
			createdAt: string
			updatedAt: string
			worldId: string
			parentActorId?: null | string
			positionX: number
			positionY: number
		}
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
		worldId: string
		icon: string
		color: string
		descriptionRich: string
		title: string
	}[]
	articles: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
		icon: string
		color: string
		position: number
		contentRich: string
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
			timestamp: string
			descriptionRich?: null | string
			worldEventId: string
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
		worldId: string
		icon: string
		color: string
		timestamp: string
		revokedAt?: null | string
		descriptionRich: string
		worldEventTrackId?: null | string
	}[]
	tags: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
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
