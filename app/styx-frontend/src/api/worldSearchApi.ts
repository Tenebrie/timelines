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
		mentions: {
			targetId: string
			targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		}[]
		mentionedIn: {
			sourceId: string
			sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		}[]
		pages: {
			id: string
			name: string
		}[]
		node: null | {
			id: string
			createdAt: string
			updatedAt: string
			worldId: string
			positionX: number
			positionY: number
			parentActorId?: null | string
		}
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
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
		position: number
		icon: string
		color: string
		contentRich: string
		parentId?: null | string
	}[]
	events: {
		mentions: {
			targetId: string
			targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		}[]
		mentionedIn: {
			sourceId: string
			sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		}[]
		pages: {
			id: string
			name: string
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
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
		worldId: string
		icon: string
		color: string
		descriptionRich: string
		timestamp: string
		revokedAt?: null | string
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
