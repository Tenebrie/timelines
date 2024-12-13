import { baseApi as api } from './baseApi'
export const addTagTypes = ['worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorldInfo: build.query<GetWorldInfoApiResponse, GetWorldInfoApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}` }),
				providesTags: ['worldDetails'],
			}),
			getWorldBrief: build.query<GetWorldBriefApiResponse, GetWorldBriefApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/brief` }),
				providesTags: ['worldDetails'],
			}),
			setWorldAccessMode: build.mutation<SetWorldAccessModeApiResponse, SetWorldAccessModeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/access`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldDetailsApi }
export type GetWorldInfoApiResponse = /** status 200  */ {
	isReadOnly: boolean
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
		introducedActors: {
			description: string
			name: string
			id: string
			createdAt: string
			updatedAt: string
			title: string
			color: string
			worldId: string
		}[]
		terminatedActors: {
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
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type GetWorldInfoApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldBriefApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type GetWorldBriefApiArg = {
	/** Any string value */
	worldId: string
}
export type SetWorldAccessModeApiResponse = unknown
export type SetWorldAccessModeApiArg = {
	/** Any string value */
	worldId: string
	body: {
		access: 'Private' | 'PublicRead' | 'PublicEdit'
	}
}
export const {
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useGetWorldBriefQuery,
	useLazyGetWorldBriefQuery,
	useSetWorldAccessModeMutation,
} = injectedRtkApi
