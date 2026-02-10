import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['actorList', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getActorContent: build.query<GetActorContentApiResponse, GetActorContentApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content`,
					params: {
						acceptDeltas: queryArg.acceptDeltas,
					},
				}),
				providesTags: ['actorList'],
			}),
			putActorContent: build.mutation<PutActorContentApiResponse, PutActorContentApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content`,
					method: 'PUT',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList'],
			}),
			getActorContentPage: build.query<GetActorContentPageApiResponse, GetActorContentPageApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content/pages/${queryArg.pageId}`,
					params: {
						acceptDeltas: queryArg.acceptDeltas,
					},
				}),
				providesTags: ['actorList'],
			}),
			putActorContentPage: build.mutation<PutActorContentPageApiResponse, PutActorContentPageApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content/pages/${queryArg.pageId}`,
					method: 'PUT',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList'],
			}),
			deleteActorContentPage: build.mutation<DeleteActorContentPageApiResponse, DeleteActorContentPageApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content/pages/${queryArg.pageId}`,
						method: 'DELETE',
					}),
					invalidatesTags: ['actorList'],
				},
			),
			createActorContentPage: build.mutation<CreateActorContentPageApiResponse, CreateActorContentPageApiArg>(
				{
					query: (queryArg) => ({
						url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content/pages`,
						method: 'POST',
						body: queryArg.body,
					}),
					invalidatesTags: ['actorList'],
				},
			),
			createActor: build.mutation<CreateActorApiResponse, CreateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actors`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList', 'worldDetails'],
			}),
			updateActor: build.mutation<UpdateActorApiResponse, UpdateActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['actorList'],
			}),
			deleteActor: build.mutation<DeleteActorApiResponse, DeleteActorApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['actorList', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as actorListApi }
export type GetActorContentApiResponse = /** status 200  */ {
	hasDeltas: boolean
	contentHtml?: string
	contentDeltas?: null | string
}
export type GetActorContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	/** Any boolean value */
	acceptDeltas?: boolean
}
export type PutActorContentApiResponse = unknown
export type PutActorContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		content: string
		contentDeltas?: string
	}
}
export type GetActorContentPageApiResponse = /** status 200  */ {
	hasDeltas: boolean
	contentHtml?: string
	contentDeltas?: null | string
}
export type GetActorContentPageApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	/** Any string value */
	pageId: string
	/** Any boolean value */
	acceptDeltas?: boolean
}
export type PutActorContentPageApiResponse = unknown
export type PutActorContentPageApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	/** Any string value */
	pageId: string
	body: {
		content: string
		contentDeltas?: string
	}
}
export type DeleteActorContentPageApiResponse = unknown
export type DeleteActorContentPageApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	/** Any string value */
	pageId: string
}
export type CreateActorContentPageApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	descriptionRich: string
	descriptionYjs?: null | string
	parentActorId?: null | string
	parentEventId?: null | string
	parentArticleId?: null | string
}
export type CreateActorContentPageApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		name: string
	}
}
export type CreateActorApiResponse = /** status 200  */ {
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
	title: string
	icon: string
	color: string
	descriptionRich: string
}
export type CreateActorApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		title?: string
		icon?: string
		color?: string
		descriptionRich?: string
	}
}
export type UpdateActorApiResponse = /** status 200  */ {
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
	title: string
	icon: string
	color: string
	descriptionRich: string
}
export type UpdateActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		name?: string
		title?: string
		icon?: string
		color?: string
	}
}
export type DeleteActorApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId: string
	title: string
	icon: string
	color: string
	descriptionRich: string
	descriptionYjs?: null | string
}
export type DeleteActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export const {
	useGetActorContentQuery,
	useLazyGetActorContentQuery,
	usePutActorContentMutation,
	useGetActorContentPageQuery,
	useLazyGetActorContentPageQuery,
	usePutActorContentPageMutation,
	useDeleteActorContentPageMutation,
	useCreateActorContentPageMutation,
	useCreateActorMutation,
	useUpdateActorMutation,
	useDeleteActorMutation,
} = injectedRtkApi
