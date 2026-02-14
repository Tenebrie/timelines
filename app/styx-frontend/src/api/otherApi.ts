import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['mindmap', 'tagList', 'worldDetails', 'worldWikiArticle', 'WorldColor'] as const
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
			createTag: build.mutation<CreateTagApiResponse, CreateTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tags`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['tagList', 'worldDetails'],
			}),
			updateTag: build.mutation<UpdateTagApiResponse, UpdateTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['tagList'],
			}),
			deleteTag: build.mutation<DeleteTagApiResponse, DeleteTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['tagList', 'worldDetails'],
			}),
			getTagDetails: build.query<GetTagDetailsApiResponse, GetTagDetailsApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}` }),
				providesTags: ['tagList'],
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
			getWorldColors: build.query<GetWorldColorsApiResponse, GetWorldColorsApiArg>({
				query: (queryArg) => ({ url: `/api/worlds/${queryArg.worldId}/colors` }),
				providesTags: ['WorldColor'],
			}),
			createWorldColor: build.mutation<CreateWorldColorApiResponse, CreateWorldColorApiArg>({
				query: (queryArg) => ({
					url: `/api/worlds/${queryArg.worldId}/colors`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['WorldColor'],
			}),
			deleteWorldColor: build.mutation<DeleteWorldColorApiResponse, DeleteWorldColorApiArg>({
				query: (queryArg) => ({
					url: `/api/worlds/${queryArg.worldId}/colors/${queryArg.colorId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['WorldColor'],
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
	contentType: 'Image' | 'Avatar'
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
export type CreateTagApiResponse = /** status 200  */ {
	mentions: {
		pageId?: null | string
		sourceId: string
		targetId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
		pageId?: null | string
		sourceId: string
		targetId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
}
export type CreateTagApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		description?: string
	}
}
export type UpdateTagApiResponse = /** status 200  */ {
	mentions: {
		pageId?: null | string
		sourceId: string
		targetId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
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
		pageId?: null | string
		sourceId: string
		targetId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
}
export type UpdateTagApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	tagId: string
	body: {
		name?: string
		description?: string
	}
}
export type DeleteTagApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
}
export type DeleteTagApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	tagId: string
}
export type GetTagDetailsApiResponse = /** status 200  */ {
	mentionedBy: {
		type: 'Actor' | 'Event' | 'Article' | 'Tag'
		id: string
		name: string
	}[]
	mentions: {
		pageId?: null | string
		sourceId: string
		targetId: string
		sourceType: 'Actor' | 'Event' | 'Article' | 'Tag'
		targetType: 'Actor' | 'Event' | 'Article' | 'Tag'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
}
export type GetTagDetailsApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	tagId: string
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
export type GetWorldColorsApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	label?: null | string
	value: string
}[]
export type GetWorldColorsApiArg = {
	/** Any string value with at least one character */
	worldId: string
}
export type CreateWorldColorApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	worldId: string
	label?: null | string
	value: string
}
export type CreateWorldColorApiArg = {
	/** Any string value with at least one character */
	worldId: string
	body: {
		value: string
		label?: string
	}
}
export type DeleteWorldColorApiResponse = unknown
export type DeleteWorldColorApiArg = {
	/** Any string value with at least one character */
	worldId: string
	/** Any string value with at least one character */
	colorId: string
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
	useListCalendarUnitFormatModesQuery,
	useLazyListCalendarUnitFormatModesQuery,
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
	useCreateTagMutation,
	useUpdateTagMutation,
	useDeleteTagMutation,
	useGetTagDetailsQuery,
	useLazyGetTagDetailsQuery,
	useGetWikiArticleContentQuery,
	useLazyGetWikiArticleContentQuery,
	usePutWikiArticleContentMutation,
	useGetWorldColorsQuery,
	useLazyGetWorldColorsQuery,
	useCreateWorldColorMutation,
	useDeleteWorldColorMutation,
	useUpdateArticleMutation,
	useGetUserWorldAccessLevelQuery,
	useLazyGetUserWorldAccessLevelQuery,
} = injectedRtkApi
