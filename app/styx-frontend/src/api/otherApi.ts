import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWiki'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAsset: build.query<GetAssetApiResponse, GetAssetApiArg>({
				query: (queryArg) => ({ url: `/api/assets/${queryArg.assetId}` }),
			}),
			requestPresignedUrl: build.mutation<RequestPresignedUrlApiResponse, RequestPresignedUrlApiArg>({
				query: (queryArg) => ({ url: `/api/assets/upload/presigned`, method: 'POST', body: queryArg.body }),
			}),
			finalizeAssetUpload: build.mutation<FinalizeAssetUploadApiResponse, FinalizeAssetUploadApiArg>({
				query: (queryArg) => ({ url: `/api/assets/upload/finalize`, method: 'POST', body: queryArg.body }),
			}),
			adminGetUserLevels: build.query<AdminGetUserLevelsApiResponse, AdminGetUserLevelsApiArg>({
				query: () => ({ url: `/api/constants/admin-levels` }),
			}),
			listWorldAccessModes: build.query<ListWorldAccessModesApiResponse, ListWorldAccessModesApiArg>({
				query: () => ({ url: `/api/constants/world-access-modes` }),
			}),
			loadFile: build.query<LoadFileApiResponse, LoadFileApiArg>({
				query: (queryArg) => ({ url: `/api/fs/image/${queryArg.format}/${queryArg.filename}` }),
			}),
			getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
				query: () => ({ url: `/health` }),
			}),
			requestImageConversion: build.mutation<RequestImageConversionApiResponse, RequestImageConversionApiArg>(
				{
					query: (queryArg) => ({ url: `/api/images/convert`, method: 'POST', body: queryArg.body }),
				},
			),
			getArticles: build.query<GetArticlesApiResponse, GetArticlesApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/wiki/articles` }),
				providesTags: ['worldWiki'],
			}),
			createArticle: build.mutation<CreateArticleApiResponse, CreateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/articles`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWiki'],
			}),
			updateArticle: build.mutation<UpdateArticleApiResponse, UpdateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWiki'],
			}),
			deleteArticle: build.mutation<DeleteArticleApiResponse, DeleteArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldWiki'],
			}),
			swapArticlePositions: build.mutation<SwapArticlePositionsApiResponse, SwapArticlePositionsApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/swap`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWiki'],
			}),
			bulkDeleteArticles: build.mutation<BulkDeleteArticlesApiResponse, BulkDeleteArticlesApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/articles/delete`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWiki'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as otherApi }
export type GetAssetApiResponse = /** status 200  */ {
	url: string
}
export type GetAssetApiArg = {
	/** Any string value */
	assetId: string
}
export type RequestPresignedUrlApiResponse = /** status 200  */ {
	asset: {
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
		contentType: 'Image'
	}
	url: string
	fields: {
		[key: string]: string
	}
}
export type RequestPresignedUrlApiArg = {
	body: {
		fileName: string
		fileSize: number
		assetType: 'Image'
	}
}
export type FinalizeAssetUploadApiResponse = /** status 200  */ {
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
	contentType: 'Image'
}
export type FinalizeAssetUploadApiArg = {
	body: {
		assetId: string
	}
}
export type AdminGetUserLevelsApiResponse = /** status 200  */ ('Free' | 'Premium' | 'Admin')[]
export type AdminGetUserLevelsApiArg = void
export type ListWorldAccessModesApiResponse = /** status 200  */ ('Private' | 'PublicRead' | 'PublicEdit')[]
export type ListWorldAccessModesApiArg = void
export type LoadFileApiResponse = unknown
export type LoadFileApiArg = {
	/** The image file extension */
	format: 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp'
	/** Any string value */
	filename: string
}
export type GetHealthApiResponse = unknown
export type GetHealthApiArg = void
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
	contentType: 'Image'
}
export type RequestImageConversionApiArg = {
	body: {
		assetId: string
		format: string
		width?: number
		height?: number
		quality?: number
	}
}
export type GetArticlesApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
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
	position: number
	contentRich: string
}[]
export type GetArticlesApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateArticleApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	position: number
	contentRich: string
}
export type CreateArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
	}
}
export type UpdateArticleApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	position: number
	contentRich: string
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
export type DeleteArticleApiResponse = unknown
export type DeleteArticleApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
}
export type SwapArticlePositionsApiResponse = unknown
export type SwapArticlePositionsApiArg = {
	/** Any string value */
	worldId: string
	body: {
		articleA: string
		articleB: string
	}
}
export type BulkDeleteArticlesApiResponse = unknown
export type BulkDeleteArticlesApiArg = {
	/** Any string value */
	worldId: string
	body: {
		articles: string[]
	}
}
export const {
	useGetAssetQuery,
	useLazyGetAssetQuery,
	useRequestPresignedUrlMutation,
	useFinalizeAssetUploadMutation,
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useLoadFileQuery,
	useLazyLoadFileQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useRequestImageConversionMutation,
	useGetArticlesQuery,
	useLazyGetArticlesQuery,
	useCreateArticleMutation,
	useUpdateArticleMutation,
	useDeleteArticleMutation,
	useSwapArticlePositionsMutation,
	useBulkDeleteArticlesMutation,
} = injectedRtkApi
