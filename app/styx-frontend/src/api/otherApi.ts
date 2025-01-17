import { baseApi as api } from './baseApi'
export const addTagTypes = [] as const
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
			getArticles: build.query<GetArticlesApiResponse, GetArticlesApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/wiki/articles` }),
			}),
			createArticle: build.mutation<CreateArticleApiResponse, CreateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/articles`,
					method: 'POST',
					body: queryArg.body,
				}),
			}),
			updateArticle: build.mutation<UpdateArticleApiResponse, UpdateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
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
export type GetArticlesApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
}[]
export type GetArticlesApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateArticleApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
}
export type CreateArticleApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
	}
}
export type UpdateArticleApiResponse = /** status 200  */ {
	name: string
	id: string
	createdAt: string
	updatedAt: string
}
export type UpdateArticleApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
	body: {
		name?: string
		descriptionRich?: string
		mentionedActors?: string[]
		mentionedEvents?: string[]
		mentionedTags?: string[]
	}
}
export const {
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useGetArticlesQuery,
	useLazyGetArticlesQuery,
	useCreateArticleMutation,
	useUpdateArticleMutation,
} = injectedRtkApi
