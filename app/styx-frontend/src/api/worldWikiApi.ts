import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWiki'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
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
	pages: {
		id: string
		name: string
	}[]
	mentions: {
		targetId: string
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
	}[]
	mentionedIn: {
		sourceId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
	}[]
	children: {
		id: string
		worldId: string
		createdAt: string
		updatedAt: string
		icon: string
		color: string
		name: string
		contentRich: string
		contentYjs?: null | string
		position: number
		parentId?: null | string
	}[]
	id: string
	worldId: string
	createdAt: string
	updatedAt: string
	icon: string
	color: string
	name: string
	contentRich: string
	position: number
	parentId?: null | string
}[]
export type GetArticlesApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateArticleApiResponse = /** status 200  */ {
	children: {
		id: string
		worldId: string
		createdAt: string
		updatedAt: string
		icon: string
		color: string
		name: string
		contentRich: string
		contentYjs?: null | string
		position: number
		parentId?: null | string
	}[]
	id: string
	worldId: string
	createdAt: string
	updatedAt: string
	icon: string
	color: string
	name: string
	contentRich: string
	position: number
	parentId?: null | string
}
export type CreateArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
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
	useDeleteArticleMutation,
	useMoveArticleMutation,
	useBulkDeleteArticlesMutation,
} = injectedRtkApi
