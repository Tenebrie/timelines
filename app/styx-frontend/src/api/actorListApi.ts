import { baseApi as api } from './baseApi'
export const addTagTypes = ['actorList', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			createActor: build.mutation<CreateActorApiResponse, CreateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actors`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList', 'worldDetails'],
			}),
			updateActor: build.mutation<UpdateActorApiResponse, UpdateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList', 'worldDetails'],
			}),
			deleteActor: build.mutation<DeleteActorApiResponse, DeleteActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['actorList', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as actorListApi }
export type CreateActorApiResponse = /** status 200  */ {
	id: string
}
export type CreateActorApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		title?: string
		color?: string
		description?: string
	}
}
export type UpdateActorApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	title: string
	color: string
	worldId: string
}
export type UpdateActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		name?: string
		title?: string
		color?: string
		description?: string
	}
}
export type DeleteActorApiResponse = /** status 200  */ {
	description: string
	name: string
	id: string
	createdAt: string
	updatedAt: string
	title: string
	color: string
	worldId: string
}
export type DeleteActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export const { useCreateActorMutation, useUpdateActorMutation, useDeleteActorMutation } = injectedRtkApi
