import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldTag', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			createTag: build.mutation<CreateTagApiResponse, CreateTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tags`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldTag', 'worldDetails'],
			}),
			updateTag: build.mutation<UpdateTagApiResponse, UpdateTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldTag'],
			}),
			deleteTag: build.mutation<DeleteTagApiResponse, DeleteTagApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldTag', 'worldDetails'],
			}),
			getTagDetails: build.query<GetTagDetailsApiResponse, GetTagDetailsApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/tag/${queryArg.tagId}` }),
				providesTags: ['worldTag'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldTagApi }
export type CreateTagApiResponse = /** status 200  */ {
	mentions: {
		sourceId: string
		targetId: string
		sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
		pageId?: null | string
	}[]
	mentionedIn: {
		sourceId: string
		targetId: string
		sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
		pageId?: null | string
	}[]
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
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
		sourceId: string
		targetId: string
		sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
		pageId?: null | string
	}[]
	mentionedIn: {
		sourceId: string
		targetId: string
		sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
		pageId?: null | string
	}[]
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
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
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
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
		type: 'Tag' | 'Actor' | 'Event' | 'Article'
		id: string
		name: string
	}[]
	mentions: {
		sourceId: string
		targetId: string
		sourceType: 'Tag' | 'Actor' | 'Event' | 'Article'
		targetType: 'Tag' | 'Actor' | 'Event' | 'Article'
		sourceActorId?: null | string
		sourceEventId?: null | string
		sourceArticleId?: null | string
		sourceTagId?: null | string
		targetActorId?: null | string
		targetEventId?: null | string
		targetArticleId?: null | string
		targetTagId?: null | string
		pageId?: null | string
	}[]
	id: string
	createdAt: string
	updatedAt: string
	name: string
	description: string
	worldId: string
}
export type GetTagDetailsApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	tagId: string
}
export const {
	useCreateTagMutation,
	useUpdateTagMutation,
	useDeleteTagMutation,
	useGetTagDetailsQuery,
	useLazyGetTagDetailsQuery,
} = injectedRtkApi
