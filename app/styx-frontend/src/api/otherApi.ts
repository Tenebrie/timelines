import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['mindmap', 'worldWikiArticle'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			adminGetUserLevels: build.query<AdminGetUserLevelsApiResponse, AdminGetUserLevelsApiArg>({
				query: () => ({ url: `/api/constants/admin-levels` }),
			}),
			listWorldAccessModes: build.query<ListWorldAccessModesApiResponse, ListWorldAccessModesApiArg>({
				query: () => ({ url: `/api/constants/world-access-modes` }),
			}),
			getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
				query: () => ({ url: `/health` }),
			}),
			getSupportedImageFormats: build.query<
				GetSupportedImageFormatsApiResponse,
				GetSupportedImageFormatsApiArg
			>({
				query: () => ({ url: `/api/images/formats` }),
			}),
			requestImageConversion: build.mutation<RequestImageConversionApiResponse, RequestImageConversionApiArg>(
				{
					query: (queryArg) => ({ url: `/api/images/convert`, method: 'POST', body: queryArg.body }),
				},
			),
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
			updateNode: build.mutation<UpdateNodeApiResponse, UpdateNodeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/mindmap/node/${queryArg.nodeId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
			}),
			deleteNode: build.mutation<DeleteNodeApiResponse, DeleteNodeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/mindmap/node/${queryArg.nodeId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['mindmap'],
			}),
			updateArticle: build.mutation<UpdateArticleApiResponse, UpdateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWikiArticle'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as otherApi }
export type AdminGetUserLevelsApiResponse = /** status 200  */ ('Free' | 'Premium' | 'Admin')[]
export type AdminGetUserLevelsApiArg = void
export type ListWorldAccessModesApiResponse = /** status 200  */ ('Private' | 'PublicRead' | 'PublicEdit')[]
export type ListWorldAccessModesApiArg = void
export type GetHealthApiResponse = unknown
export type GetHealthApiArg = void
export type GetSupportedImageFormatsApiResponse = /** status 200  */ {
	formats: ('webp' | 'jpeg' | 'png' | 'gif')[]
}
export type GetSupportedImageFormatsApiArg = void
export type RequestImageConversionApiResponse = /** status 200  */ {
	status: 'Pending' | 'Finalized' | 'Failed'
	id: string
	createdAt: string
	updatedAt: string
	ownerId: string
	size: number
	expiresAt?: null | string
	bucketKey: string
	originalFileName: string
	originalFileExtension: string
	contentType: 'ImageConversion' | 'Avatar'
}
export type RequestImageConversionApiArg = {
	body: {
		assetId: string
		format: 'webp' | 'jpeg' | 'png' | 'gif'
		width?: number
		height?: number
		quality?: number
	}
}
export type GetMindmapApiResponse = /** status 200  */ {
	nodes: {
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		positionX: number
		positionY: number
		parentActorId?: null | string
	}[]
}
export type GetMindmapApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateNodeApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	positionX: number
	positionY: number
	parentActorId?: null | string
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
export type UpdateNodeApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	positionX: number
	positionY: number
	parentActorId?: null | string
}
export type UpdateNodeApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	nodeId: string
	body: {
		positionX?: number
		positionY?: number
	}
}
export type DeleteNodeApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	positionX: number
	positionY: number
	parentActorId?: null | string
}
export type DeleteNodeApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	nodeId: string
}
export type UpdateArticleApiResponse = /** status 200  */ {
	children: {
		worldId: string
		id: string
		createdAt: string
		updatedAt: string
		name: string
		icon: string
		color: string
		position: number
		contentRich: string
		parentId?: null | string
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	position: number
	contentRich: string
	parentId?: null | string
}
export type UpdateArticleApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
	body: {
		name?: string
		icon?: string
		color?: string
		contentRich?: string
		mentions?: {
			targetId: string
			targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		}[]
	}
}
export const {
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useGetSupportedImageFormatsQuery,
	useLazyGetSupportedImageFormatsQuery,
	useRequestImageConversionMutation,
	useGetMindmapQuery,
	useLazyGetMindmapQuery,
	useCreateNodeMutation,
	useUpdateNodeMutation,
	useDeleteNodeMutation,
	useUpdateArticleMutation,
} = injectedRtkApi
