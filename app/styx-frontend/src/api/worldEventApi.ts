import { baseApi as api } from './base/baseApi'
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
		id: string
		createdAt: string
		updatedAt: string
		name?: null | string
		descriptionRich?: null | string
		timestamp: string
		worldEventId: string
	}[]
	description: string
	type: 'SCENE' | 'OTHER'
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	descriptionRich: string
	timestamp: string
	revokedAt?: null | string
	customName: boolean
	externalLink: string
	extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
	worldEventTrackId?: null | string
}
export type CreateWorldEventApiArg = {
	/** Any string value */
	worldId: string
	body: {
		id?: string
		name?: string
		icon?: string
		color?: string
		description: string
		descriptionRich?: string
		timestamp: string
		revokedAt?: null | string
		customName?: boolean
		externalLink?: string
		worldEventTrackId?: string
		mentions?: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
	}
}
export type UpdateWorldEventApiResponse = /** status 200  */ {
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
		id: string
		createdAt: string
		updatedAt: string
		name?: null | string
		descriptionRich?: null | string
		timestamp: string
		worldEventId: string
	}[]
	description: string
	type: 'SCENE' | 'OTHER'
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	descriptionRich: string
	timestamp: string
	revokedAt?: null | string
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
		color?: string
		timestamp?: string
		revokedAt?: null | string
		description?: string
		descriptionRich?: string
		mentions?: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
		customNameEnabled?: boolean
		externalLink?: string
		worldEventTrackId?: null | string
	}
}
export type DeleteWorldEventApiResponse = /** status 200  */ {
	count: number
}
export type DeleteWorldEventApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
}
export type RevokeWorldEventApiResponse = /** status 200  */ {
	description: string
	type: 'SCENE' | 'OTHER'
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	descriptionRich: string
	timestamp: string
	revokedAt?: null | string
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
	type: 'SCENE' | 'OTHER'
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	descriptionRich: string
	timestamp: string
	revokedAt?: null | string
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
