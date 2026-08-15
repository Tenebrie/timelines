import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['actorList', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
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
			getActorBacklinks: build.query<GetActorBacklinksApiResponse, GetActorBacklinksApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/actor/${queryArg.actorId}/backlinks` }),
				providesTags: ['actorList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as actorListApi }
export type CreateActorApiResponse = /** status 200  */ {
	pages: {
		id: string
		name: string
	}[]
	mentions: {
		id: string
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
		pageId?: null | string
	}[]
	mentionedIn: {
		id: string
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
		pageId?: null | string
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	icon: string
	color: string
	content: string
	contentRich: string
	parentFolderId?: null | string
	parentFolderPosition: number
}
export type CreateActorApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		title?: string
		icon?: string
		color?: string
		contentRich?: string
		parentFolderId?: null | string
	}
}
export type UpdateActorApiResponse = /** status 200  */ {
	pages: {
		id: string
		name: string
	}[]
	mentions: {
		id: string
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
		pageId?: null | string
	}[]
	mentionedIn: {
		id: string
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
		pageId?: null | string
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	icon: string
	color: string
	content: string
	contentRich: string
	parentFolderId?: null | string
	parentFolderPosition: number
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
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	title: string
	icon: string
	color: string
	content: string
	contentRich: string
	parentFolderId?: null | string
	parentFolderPosition: number
}
export type DeleteActorApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export type GetActorBacklinksApiResponse = /** status 200  */ {
	type: 'Actor' | 'Event' | 'Article' | 'Tag'
	id: string
	name: string
}[]
export type GetActorBacklinksApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	actorId: string
}
export const {
	useCreateActorMutation,
	useUpdateActorMutation,
	useDeleteActorMutation,
	useGetActorBacklinksQuery,
	useLazyGetActorBacklinksQuery,
} = injectedRtkApi
