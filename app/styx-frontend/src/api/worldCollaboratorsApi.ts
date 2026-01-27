import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldCollaborators'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorldCollaborators: build.query<GetWorldCollaboratorsApiResponse, GetWorldCollaboratorsApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/collaborators` }),
				providesTags: ['worldCollaborators'],
			}),
			shareWorld: build.mutation<ShareWorldApiResponse, ShareWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldCollaborators'],
			}),
			unshareWorld: build.mutation<UnshareWorldApiResponse, UnshareWorldApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/share/${queryArg.userId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldCollaborators'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldCollaboratorsApi }
export type GetWorldCollaboratorsApiResponse = /** status 200  */ {
	user: {
		id: string
		email: string
	}
	worldId: string
	access: 'ReadOnly' | 'Editing'
}[]
export type GetWorldCollaboratorsApiArg = {
	/** Any string value */
	worldId: string
}
export type ShareWorldApiResponse = unknown
export type ShareWorldApiArg = {
	/** Any string value */
	worldId: string
	body: {
		userEmails: string[]
		access: 'ReadOnly' | 'Editing'
	}
}
export type UnshareWorldApiResponse = unknown
export type UnshareWorldApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	userId: string
}
export const {
	useGetWorldCollaboratorsQuery,
	useLazyGetWorldCollaboratorsQuery,
	useShareWorldMutation,
	useUnshareWorldMutation,
} = injectedRtkApi
