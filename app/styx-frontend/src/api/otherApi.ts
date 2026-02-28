import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWikiArticle', 'worldShareLink'] as const
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
			listCalendarTemplates: build.query<ListCalendarTemplatesApiResponse, ListCalendarTemplatesApiArg>({
				query: () => ({ url: `/api/constants/calendar-templates` }),
			}),
			listCalendarUnitFormatModes: build.query<
				ListCalendarUnitFormatModesApiResponse,
				ListCalendarUnitFormatModesApiArg
			>({
				query: () => ({ url: `/api/constants/calendar-unit-format-modes` }),
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
			updateNode: build.mutation<UpdateNodeApiResponse, UpdateNodeApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/mindmap/node/${queryArg.nodeId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
			}),
			getWikiArticleContent: build.query<GetWikiArticleContentApiResponse, GetWikiArticleContentApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/article/${queryArg.articleId}/content`,
					params: {
						acceptDeltas: queryArg.acceptDeltas,
					},
				}),
				providesTags: ['worldWikiArticle'],
			}),
			putWikiArticleContent: build.mutation<PutWikiArticleContentApiResponse, PutWikiArticleContentApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/article/${queryArg.articleId}/content`,
					method: 'PUT',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWikiArticle'],
			}),
			listWorldShareLinks: build.query<ListWorldShareLinksApiResponse, ListWorldShareLinksApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/share-links` }),
				providesTags: ['worldShareLink'],
			}),
			generateFreeWorldShareLink: build.mutation<
				GenerateFreeWorldShareLinkApiResponse,
				GenerateFreeWorldShareLinkApiArg
			>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share-link/generate`,
					method: 'POST',
					body: queryArg.body,
				}),
			}),
			createWorldShareLink: build.mutation<CreateWorldShareLinkApiResponse, CreateWorldShareLinkApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share-link`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldShareLink'],
			}),
			expireWorldShareLink: build.mutation<ExpireWorldShareLinkApiResponse, ExpireWorldShareLinkApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share-link/${queryArg.shareLinkId}/expire`,
					method: 'POST',
				}),
				invalidatesTags: ['worldShareLink'],
			}),
			deleteWorldShareLink: build.mutation<DeleteWorldShareLinkApiResponse, DeleteWorldShareLinkApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share-link/${queryArg.shareLinkId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldShareLink'],
			}),
			visitWorldShareLink: build.query<VisitWorldShareLinkApiResponse, VisitWorldShareLinkApiArg>({
				query: (queryArg) => ({ url: `/api/share-link-visit/${queryArg.slug}` }),
			}),
			acceptWorldShareLink: build.mutation<AcceptWorldShareLinkApiResponse, AcceptWorldShareLinkApiArg>({
				query: (queryArg) => ({ url: `/api/share-link-visit/${queryArg.slug}/accept`, method: 'POST' }),
			}),
			updateArticle: build.mutation<UpdateArticleApiResponse, UpdateArticleApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/article/${queryArg.articleId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWikiArticle'],
			}),
			getUserWorldAccessLevel: build.query<GetUserWorldAccessLevelApiResponse, GetUserWorldAccessLevelApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/internal/auth/${queryArg.userId}`,
						params: {
							worldId: queryArg.worldId,
						},
					}),
				},
			),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as otherApi }
export type AdminGetUserLevelsApiResponse = /** status 200  */ ('Free' | 'Premium' | 'Admin')[]
export type AdminGetUserLevelsApiArg = void
export type ListWorldAccessModesApiResponse = /** status 200  */ ('Private' | 'PublicRead' | 'PublicEdit')[]
export type ListWorldAccessModesApiArg = void
export type ListCalendarTemplatesApiResponse = /** status 200  */ {
	keys: ('earth_current' | 'martian' | 'pf2e_current' | 'rimworld' | 'exether')[]
	templates: {
		name: string
		description: string
		id: string
	}[]
}
export type ListCalendarTemplatesApiArg = void
export type ListCalendarUnitFormatModesApiResponse = /** status 200  */ (
	| 'Name'
	| 'NameOneIndexed'
	| 'Numeric'
	| 'NumericOneIndexed'
	| 'Hidden'
)[]
export type ListCalendarUnitFormatModesApiArg = void
export type GetHealthApiResponse = unknown
export type GetHealthApiArg = void
export type GetSupportedImageFormatsApiResponse = /** status 200  */ {
	formats: ('webp' | 'jpeg' | 'png' | 'gif')[]
}
export type GetSupportedImageFormatsApiArg = void
export type RequestImageConversionApiResponse = /** status 200  */ {
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
	status: 'Pending' | 'Finalized' | 'Failed'
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
export type UpdateNodeApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	parentActorId?: null | string
	positionX: number
	positionY: number
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
export type GetWikiArticleContentApiResponse = /** status 200  */ {
	hasDeltas: boolean
	contentHtml?: string
	contentDeltas?: null | string
}
export type GetWikiArticleContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
	/** Any boolean value */
	acceptDeltas?: boolean
}
export type PutWikiArticleContentApiResponse = unknown
export type PutWikiArticleContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	articleId: string
	body: {
		content: string
		contentDeltas?: string
	}
}
export type ListWorldShareLinksApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	accessMode: 'ReadOnly' | 'Editing'
	worldId: string
	label: null | string
	slug: string
	expiresAt: null | string
	usageCount: number
}[]
export type ListWorldShareLinksApiArg = {
	/** Any string value */
	worldId: string
}
export type GenerateFreeWorldShareLinkApiResponse = /** status 200  */ {
	slug: string
	preferredSlugFree: boolean
}
export type GenerateFreeWorldShareLinkApiArg = {
	/** Any string value */
	worldId: string
	body: {
		preferredSlug?: string
	}
}
export type CreateWorldShareLinkApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	accessMode: 'ReadOnly' | 'Editing'
	worldId: string
	label?: null | string
	slug: string
	expiresAt?: null | string
	usageCount: number
}
export type CreateWorldShareLinkApiArg = {
	/** Any string value */
	worldId: string
	body: {
		slug: string
		label: string
		expiresAt?: string
		accessMode: 'ReadOnly' | 'Editing'
	}
}
export type ExpireWorldShareLinkApiResponse = unknown
export type ExpireWorldShareLinkApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	shareLinkId: string
}
export type DeleteWorldShareLinkApiResponse = unknown
export type DeleteWorldShareLinkApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	shareLinkId: string
}
export type VisitWorldShareLinkApiResponse = /** status 200  */ {
	world: {
		id: string
		name: string
		description: string
	}
	linkAccess: 'ReadOnly' | 'Editing'
	alreadyHasAccess: boolean
}
export type VisitWorldShareLinkApiArg = {
	/** Any string value */
	slug: string
}
export type AcceptWorldShareLinkApiResponse = /** status 200  */ {
	world: {
		id: string
		name: string
		description: string
	}
	linkAccess: 'ReadOnly' | 'Editing'
	alreadyHasAccess: boolean
}
export type AcceptWorldShareLinkApiArg = {
	/** Any string value */
	slug: string
}
export type UpdateArticleApiResponse = /** status 200  */ {
	children: {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		worldId: string
		icon: string
		color: string
		position: number
		contentRich: string
		contentYjs?: null | string
		parentId?: null | string
	}[]
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
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
	}
}
export type GetUserWorldAccessLevelApiResponse = /** status 200  */ {
	owner: boolean
	write: boolean
	read: boolean
}
export type GetUserWorldAccessLevelApiArg = {
	/** Any string value with at least one character */
	userId: string
	/** Any string value with at least one character */
	worldId: string
}
export const {
	useAdminGetUserLevelsQuery,
	useLazyAdminGetUserLevelsQuery,
	useListWorldAccessModesQuery,
	useLazyListWorldAccessModesQuery,
	useListCalendarTemplatesQuery,
	useLazyListCalendarTemplatesQuery,
	useListCalendarUnitFormatModesQuery,
	useLazyListCalendarUnitFormatModesQuery,
	useGetHealthQuery,
	useLazyGetHealthQuery,
	useGetSupportedImageFormatsQuery,
	useLazyGetSupportedImageFormatsQuery,
	useRequestImageConversionMutation,
	useUpdateNodeMutation,
	useGetWikiArticleContentQuery,
	useLazyGetWikiArticleContentQuery,
	usePutWikiArticleContentMutation,
	useListWorldShareLinksQuery,
	useLazyListWorldShareLinksQuery,
	useGenerateFreeWorldShareLinkMutation,
	useCreateWorldShareLinkMutation,
	useExpireWorldShareLinkMutation,
	useDeleteWorldShareLinkMutation,
	useVisitWorldShareLinkQuery,
	useLazyVisitWorldShareLinkQuery,
	useAcceptWorldShareLinkMutation,
	useUpdateArticleMutation,
	useGetUserWorldAccessLevelQuery,
	useLazyGetUserWorldAccessLevelQuery,
} = injectedRtkApi
