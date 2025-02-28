import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			updateWorld: build.mutation<UpdateWorldApiResponse, UpdateWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldDetails'],
			}),
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
export type UpdateWorldApiResponse = unknown
export type UpdateWorldApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name?: string
		description?: string
		calendar?: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin?: number
	}
}
export type GetWorldInfoApiResponse = /** status 200  */ {
	isReadOnly: boolean
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
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		title: string
		icon: string
		color: string
		descriptionRich: string
	}[]
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
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
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
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
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
	useUpdateWorldMutation,
	useGetWorldInfoQuery,
	useLazyGetWorldInfoQuery,
	useGetWorldBriefQuery,
	useLazyGetWorldBriefQuery,
	useSetWorldAccessModeMutation,
} = injectedRtkApi
