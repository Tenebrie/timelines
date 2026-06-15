import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldWikiFolder'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFolders: build.query<GetFoldersApiResponse, GetFoldersApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/wiki/folders` }),
				providesTags: ['worldWikiFolder'],
			}),
			createFolder: build.mutation<CreateFolderApiResponse, CreateFolderApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/folders`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWikiFolder'],
			}),
			updateFolder: build.mutation<UpdateFolderApiResponse, UpdateFolderApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/folder/${queryArg.folderId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldWikiFolder'],
			}),
			deleteFolder: build.mutation<DeleteFolderApiResponse, DeleteFolderApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/wiki/folder/${queryArg.folderId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldWikiFolder'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldWikiFolderApi }
export type GetFoldersApiResponse = /** status 200  */ {
	actors: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	events: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	articles: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	tags: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	children: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	parentFolderId?: null | string
	parentFolderPosition: number
}[]
export type GetFoldersApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateFolderApiResponse = /** status 200  */ {
	actors: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	events: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	articles: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	tags: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	children: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	parentFolderId?: null | string
	parentFolderPosition: number
}
export type CreateFolderApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		icon?: string
		color?: string
		parentFolderId?: null | string
	}
}
export type UpdateFolderApiResponse = /** status 200  */ {
	actors: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	events: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	articles: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	tags: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	children: {
		id: string
		parentFolderId: null | string
		parentFolderPosition: number
	}[]
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	icon: string
	color: string
	parentFolderId?: null | string
	parentFolderPosition: number
}
export type UpdateFolderApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	folderId: string
	body: {
		name?: string
		icon?: string
		color?: string
	}
}
export type DeleteFolderApiResponse = unknown
export type DeleteFolderApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	folderId: string
}
export const {
	useGetFoldersQuery,
	useLazyGetFoldersQuery,
	useCreateFolderMutation,
	useUpdateFolderMutation,
	useDeleteFolderMutation,
} = injectedRtkApi
