import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWiki'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getArticles: build.query<GetArticlesApiResponse, GetArticlesApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/articles`,
					params: {
						parentId: queryArg.parentId,
					},
				}),
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
			moveArticle: build.mutation<MoveArticleApiResponse, MoveArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/move`,
					method: 'POST',
					body: queryArg.body,
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
export { injectedRtkApi as worldWikiApi }
export type GetArticlesApiResponse = /** status 200  */ {
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
}[]
export type GetArticlesApiArg = {
	/** Any string value */
	worldId: string
	/** Any string or null value */
	parentId?: null | string
}
export type CreateArticleApiResponse = /** status 200  */ {
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
export type CreateArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
	}
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
export type DeleteArticleApiResponse = unknown
export type DeleteArticleApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
}
export type MoveArticleApiResponse = unknown
export type MoveArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		articleId: string
		parentId?: null | string
		position: number
	}
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
	useGetArticlesQuery,
	useLazyGetArticlesQuery,
	useCreateArticleMutation,
	useUpdateArticleMutation,
	useDeleteArticleMutation,
	useMoveArticleMutation,
	useSwapArticlePositionsMutation,
	useBulkDeleteArticlesMutation,
} = injectedRtkApi
