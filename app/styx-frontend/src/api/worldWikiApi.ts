import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWiki', 'worldWikiArticle'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getArticles: build.query<GetArticlesApiResponse, GetArticlesApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/wiki/articles` }),
				providesTags: ['worldWiki', 'worldWikiArticle'],
			}),
			createArticle: build.mutation<CreateArticleApiResponse, CreateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/articles`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWiki', 'worldWikiArticle'],
			}),
			deleteArticle: build.mutation<DeleteArticleApiResponse, DeleteArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldWiki', 'worldWikiArticle'],
			}),
			moveWikiEntity: build.mutation<MoveWikiEntityApiResponse, MoveWikiEntityApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/move`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: [],
			}),
			bulkMoveWikiEntities: build.mutation<BulkMoveWikiEntitiesApiResponse, BulkMoveWikiEntitiesApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/bulk/move`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: [],
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
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	content: string
	contentRich: string
	parentFolderId?: null | string
	parentFolderPosition: number
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
	content: string
	contentRich: string
	parentFolderId?: null | string
	parentFolderPosition: number
}
export type CreateArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		icon?: string
		color?: string
		contentRich?: string
		parentFolderId?: null | string
	}
}
export type DeleteArticleApiResponse = unknown
export type DeleteArticleApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
}
export type MoveWikiEntityApiResponse = /** status 200  */ {
	updates: {
		entityId: string
		entityType: 'actor' | 'tag' | 'event' | 'article' | 'folder'
		position: number
		folderId?: null | string
	}[]
}
export type MoveWikiEntityApiArg = {
	/** Any string value */
	worldId: string
	body: {
		entityId: string
		parentId?: null | string
		position: number
	}
}
export type BulkMoveWikiEntitiesApiResponse = /** status 200  */ {
	updates: {
		entityId: string
		entityType: 'actor' | 'tag' | 'event' | 'article' | 'folder'
		position: number
		folderId?: null | string
	}[]
}
export type BulkMoveWikiEntitiesApiArg = {
	/** Any string value */
	worldId: string
	body: {
		entityIds: string[]
		parentId?: null | string
		position: number
	}
}
export const {
	useGetArticlesQuery,
	useLazyGetArticlesQuery,
	useCreateArticleMutation,
	useDeleteArticleMutation,
	useMoveWikiEntityMutation,
	useBulkMoveWikiEntitiesMutation,
} = injectedRtkApi
