import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldList'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorlds: build.query<GetWorldsApiResponse, GetWorldsApiArg>({
				query: () => ({ url: `/api/worlds` }),
				providesTags: ['worldList'],
			}),
			createWorld: build.mutation<CreateWorldApiResponse, CreateWorldApiArg>({
				query: (queryArg) => ({ url: `/api/worlds`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['worldList'],
			}),
			deleteWorld: build.mutation<DeleteWorldApiResponse, DeleteWorldApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}`, method: 'DELETE' }),
				invalidatesTags: ['worldList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldListApi }
export type GetWorldsApiResponse = /** status 200  */ {
	ownedWorlds: {
		calendars: {
			name: string
			id: string
			createdAt: string
			updatedAt: string
			description: string
			ownerId?: null | string
			position: number
			originTime: string
			dateFormat?: null | string
			worldId?: null | string
		}[]
		collaborators: {
			worldId: string
			access: 'ReadOnly' | 'Editing'
			userId: string
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		description: string
		calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	contributableWorlds: {
		calendars: {
			name: string
			id: string
			createdAt: string
			updatedAt: string
			description: string
			ownerId?: null | string
			position: number
			originTime: string
			dateFormat?: null | string
			worldId?: null | string
		}[]
		collaborators: {
			worldId: string
			access: 'ReadOnly' | 'Editing'
			userId: string
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		description: string
		calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	visibleWorlds: {
		calendars: {
			name: string
			id: string
			createdAt: string
			updatedAt: string
			description: string
			ownerId?: null | string
			position: number
			originTime: string
			dateFormat?: null | string
			worldId?: null | string
		}[]
		collaborators: {
			worldId: string
			access: 'ReadOnly' | 'Editing'
			userId: string
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		description: string
		calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
}
export type GetWorldsApiArg = void
export type CreateWorldApiResponse = /** status 200  */ {
	name: string
	id: string
}
export type CreateWorldApiArg = {
	body: {
		name: string
		description?: string
		calendars?: string[]
		timeOrigin?: number
	}
}
export type DeleteWorldApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	description: string
	calendar?: null | 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
	timeOrigin: string
	ownerId: string
	accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
}
export type DeleteWorldApiArg = {
	/** Any string value */
	worldId: string
}
export const { useGetWorldsQuery, useLazyGetWorldsQuery, useCreateWorldMutation, useDeleteWorldMutation } =
	injectedRtkApi
