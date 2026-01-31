import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldDetails', 'worldCommonIcons'] as const
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
			getCommonWorldEventIcons: build.query<
				GetCommonWorldEventIconsApiResponse,
				GetCommonWorldEventIconsApiArg
			>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/icons/events/common` }),
				providesTags: ['worldDetails', 'worldCommonIcons'],
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
	calendars: {
		units: {
			children: {
				id: string
				createdAt: string
				updatedAt: string
				position: number
				label?: null | string
				repeats: number
				parentUnitId: string
				childUnitId: string
			}[]
			calendarId: string
			id: string
			createdAt: string
			updatedAt: string
			position: number
			name: string
			displayName?: null | string
			displayNameShort?: null | string
			displayNamePlural?: null | string
			displayFormat: 'Name' | 'Numeric' | 'Hidden'
			dateFormatShorthand?: null | string
			duration: number
		}[]
		ownerId?: null | string
		id: string
		createdAt: string
		updatedAt: string
		position: number
		name: string
		dateFormat?: null | string
		worldId?: null | string
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
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
		worldId: string
		icon: string
		color: string
		descriptionRich: string
		descriptionYjs?: null | string
		title: string
	}[]
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
		type: 'SCENE' | 'OTHER'
		icon: string
		color: string
		timestamp: string
		revokedAt?: null | string
		descriptionRich: string
		descriptionYjs?: null | string
		customName: boolean
		externalLink: string
		extraFields: ('EventIcon' | 'TargetActors' | 'MentionedActors' | 'ExternalLink')[]
		worldEventTrackId?: null | string
	}[]
	ownerId: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
	timeOrigin: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type GetWorldInfoApiArg = {
	/** Any string value */
	worldId: string
}
export type GetCommonWorldEventIconsApiResponse = /** status 200  */ {
	collections: {
		id: string
		name: string
		icons: string[]
		count: number
		procedural: boolean
	}[]
}
export type GetCommonWorldEventIconsApiArg = {
	/** Any string value */
	worldId: string
}
export type GetWorldBriefApiResponse = /** status 200  */ {
	ownerId: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
	timeOrigin: string
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
	useGetCommonWorldEventIconsQuery,
	useLazyGetCommonWorldEventIconsQuery,
	useGetWorldBriefQuery,
	useLazyGetWorldBriefQuery,
	useSetWorldAccessModeMutation,
} = injectedRtkApi
