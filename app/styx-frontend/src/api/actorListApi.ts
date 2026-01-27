import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['actorList', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getActorContent: build.query<GetActorContentApiResponse, GetActorContentApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/content` }),
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
	contentRich: string
}
export type GetActorContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export type PutActorContentApiResponse = unknown
export type PutActorContentApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
	body: {
		content: string
	}
}
export type CreateActorApiResponse = /** status 200  */ {
	mentions: {
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
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
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
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
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
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	icon: string
	color: string
	descriptionRich: string
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
	useCreateActorMutation,
	useUpdateActorMutation,
	useDeleteActorMutation,
} = injectedRtkApi
