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
		mentionedActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
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
		name: string
		id: string
		createdAt: string
		updatedAt: string
		worldId: string
		type: 'SCENE' | 'OTHER'
		icon: string
		timestamp: string
		revokedAt?: null | string
		descriptionRich: string
		customName: boolean
		externalLink: string
		extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId?: null | string
	}[]
	actors: {
		statements: {
			id: string
		}[]
		relationships: {
			name: string
			originId: string
			receiverId: string
		}[]
		receivedRelationships: {
			name: string
			originId: string
			receiverId: string
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
