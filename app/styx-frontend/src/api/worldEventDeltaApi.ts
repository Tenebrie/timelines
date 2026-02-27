import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldEventDelta', 'worldEvent', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			createWorldEventDelta: build.mutation<CreateWorldEventDeltaApiResponse, CreateWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventDelta', 'worldEvent', 'worldDetails'],
			}),
			updateWorldEventDelta: build.mutation<UpdateWorldEventDeltaApiResponse, UpdateWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta/${queryArg.deltaId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventDelta', 'worldEvent', 'worldDetails'],
			}),
			deleteWorldEventDelta: build.mutation<DeleteWorldEventDeltaApiResponse, DeleteWorldEventDeltaApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event/${queryArg.eventId}/delta/${queryArg.deltaId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldEventDelta', 'worldEvent', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldEventDeltaApi }
export type CreateWorldEventDeltaApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	body: {
		timestamp: string
		name: null | string
		description: null | string
		descriptionRich: null | string
	}
}
export type UpdateWorldEventDeltaApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name?: null | string
	description?: null | string
	descriptionRich?: null | string
	timestamp: string
	worldEventId: string
}
export type UpdateWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	/** Any string value */
	deltaId: string
	body: {
		timestamp?: string
		name?: null | string
		description?: null | string
		descriptionRich?: null | string
	}
}
export type DeleteWorldEventDeltaApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name?: null | string
	description?: null | string
	descriptionRich?: null | string
	timestamp: string
	worldEventId: string
}
export type DeleteWorldEventDeltaApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	eventId: string
	/** Any string value */
	deltaId: string
}
export const {
	useCreateWorldEventDeltaMutation,
	useUpdateWorldEventDeltaMutation,
	useDeleteWorldEventDeltaMutation,
} = injectedRtkApi
