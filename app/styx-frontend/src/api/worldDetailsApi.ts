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
		calendars?: string[]
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
				label?: null | string
				position: number
				calendarId: string
				shortLabel?: null | string
				repeats: number
				parentUnitId: string
				childUnitId: string
			}[]
			parents: {
				id: string
				createdAt: string
				updatedAt: string
				label?: null | string
				position: number
				calendarId: string
				shortLabel?: null | string
				repeats: number
				parentUnitId: string
				childUnitId: string
			}[]
			id: string
			position: number
			formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
			negativeFormat: 'MinusSign' | 'AbsoluteValue'
			name: string
			displayName: string
			displayNameShort: string
			displayNamePlural: string
			formatShorthand?: null | string
			duration: string
			treeDepth: number
		}[]
		seasons: {
			intervals: {
				id: string
				createdAt: string
				updatedAt: string
				calendarId: string
				leftIndex: number
				rightIndex: number
				seasonId: string
			}[]
			id: string
			position: number
			name: string
			formatShorthand?: null | string
		}[]
		presentations: {
			units: {
				id: string
				createdAt: string
				updatedAt: string
				position: number
				calendarId: string
				name: string
				formatString: string
				subdivision: number
				labeledIndices: number[]
				unitId: string
				presentationId: string
			}[]
			id: string
			name: string
			compression: number
			scaleFactor: number
			baselineUnitId?: null | string
		}[]
		id: string
		updatedAt: string
		position: number
		name: string
		description: string
		originTime: string
		dateFormat?: null | string
	}[]
	tags: {
		mentions: {
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetId: string
		}[]
		mentionedIn: {
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		description: string
		worldId: string
	}[]
	actors: {
		mentions: {
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetId: string
		}[]
		pages: {
			id: string
			name: string
		}[]
		mentionedIn: {
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
		}[]
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
	events: {
		mentions: {
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
			targetId: string
		}[]
		pages: {
			id: string
			name: string
		}[]
		mentionedIn: {
			sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
			sourceId: string
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
	calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	timeOrigin: string
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
	calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	timeOrigin: string
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
