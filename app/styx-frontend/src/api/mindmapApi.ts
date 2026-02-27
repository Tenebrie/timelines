import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['mindmap'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getMindmap: build.query<GetMindmapApiResponse, GetMindmapApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/mindmap` }),
				providesTags: ['mindmap'],
			}),
			createNode: build.mutation<CreateNodeApiResponse, CreateNodeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/mindmap/node`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['mindmap'],
			}),
			deleteNode: build.mutation<DeleteNodeApiResponse, DeleteNodeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/mindmap/node/${queryArg.nodeId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['mindmap'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as mindmapApi }
export type GetMindmapApiResponse = /** status 200  */ {
	nodes: {
		id: string
		createdAt: string
		updatedAt: string
		worldId: string
		parentActorId?: null | string
		positionX: number
		positionY: number
	}[]
}
export type GetMindmapApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateNodeApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	parentActorId?: null | string
	positionX: number
	positionY: number
}
export type CreateNodeApiArg = {
	/** Any string value */
	worldId: string
	body: {
		positionX: number
		positionY: number
		parentActorId?: string
	}
}
export type DeleteNodeApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	parentActorId?: null | string
	positionX: number
	positionY: number
}
export type DeleteNodeApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	nodeId: string
}
export const { useGetMindmapQuery, useLazyGetMindmapQuery, useCreateNodeMutation, useDeleteNodeMutation } =
	injectedRtkApi
