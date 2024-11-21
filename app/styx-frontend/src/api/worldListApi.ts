import { baseApi as api } from './baseApi'
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
				query: (queryArg) => ({ url: `/api/world`, method: 'POST', body: queryArg.body }),
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
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	contributableWorlds: {
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin: string
		ownerId: string
		accessMode: 'Private' | 'PublicRead' | 'PublicEdit'
	}[]
	visibleWorlds: {
		collaborators: {
			worldId: string
			userId: string
			access: 'ReadOnly' | 'Editing'
		}[]
		name: string
		id: string
		createdAt: string
		updatedAt: string
		calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
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
		calendar?: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
		timeOrigin?: number
	}
}
export type DeleteWorldApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
	calendar: 'COUNTUP' | 'EARTH' | 'PF2E' | 'RIMWORLD' | 'EXETHER'
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