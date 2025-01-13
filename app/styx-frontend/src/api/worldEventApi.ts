import { baseApi as api } from './baseApi'
export const addTagTypes = ['worldEvent', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			createWorldEvent: build.mutation<CreateWorldEventApiResponse, CreateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEvent', 'worldDetails'],
			}),
			updateWorldEvent: build.mutation<UpdateWorldEventApiResponse, UpdateWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEvent'],
			}),
			deleteWorldEvent: build.mutation<DeleteWorldEventApiResponse, DeleteWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldEvent', 'worldDetails'],
			}),
			revokeWorldEvent: build.mutation<RevokeWorldEventApiResponse, RevokeWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/revoke`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEvent', 'worldDetails'],
			}),
			unrevokeWorldEvent: build.mutation<UnrevokeWorldEventApiResponse, UnrevokeWorldEventApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/unrevoke`,
					method: 'POST',
				}),
				invalidatesTags: ['worldEvent', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldEventApi }
export type CreateWorldEventApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	body: {
		type: 'SCENE' | 'OTHER'
		modules: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		name: string
		icon: string
		description: string
		descriptionRich: string
		timestamp: string
		revokedAt: null | string
		mentionedActorIds: string[]
		customNameEnabled: boolean
		externalLink: string
		worldEventTrackId?: string
	}
}
export type UpdateWorldEventApiResponse = /** status 200  */ {
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
}
export type UpdateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		modules?: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		name?: string
		icon?: string
		timestamp?: string
		revokedAt?: null | string
		description?: string
		descriptionRich?: string
		mentionedActorIds?: string[]
		customNameEnabled?: boolean
		externalLink?: string
		worldEventTrackId?: null | string
	}
}
export type DeleteWorldEventApiResponse = /** status 200  */ {
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
}
export type DeleteWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type RevokeWorldEventApiResponse = /** status 200  */ {
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
}
export type RevokeWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		revokedAt: string
	}
}
export type UnrevokeWorldEventApiResponse = /** status 200  */ {
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
}
export type UnrevokeWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export const {
	useCreateWorldEventMutation,
	useUpdateWorldEventMutation,
	useDeleteWorldEventMutation,
	useRevokeWorldEventMutation,
	useUnrevokeWorldEventMutation,
} = injectedRtkApi
