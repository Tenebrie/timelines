import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['worldEventTracks'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getWorldEventTracks: build.query<GetWorldEventTracksApiResponse, GetWorldEventTracksApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/event-tracks` }),
				providesTags: ['worldEventTracks'],
			}),
			createWorldEventTrack: build.mutation<CreateWorldEventTrackApiResponse, CreateWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			updateWorldEventTrack: build.mutation<UpdateWorldEventTrackApiResponse, UpdateWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/${queryArg.trackId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			deleteWorldEventTrack: build.mutation<DeleteWorldEventTrackApiResponse, DeleteWorldEventTrackApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/${queryArg.trackId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
			swapWorldEventTracks: build.mutation<SwapWorldEventTracksApiResponse, SwapWorldEventTracksApiArg>({
				query: (queryArg) => ({
					url: `/api/world/${queryArg.worldId}/event-track/swap`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['worldEventTracks'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as worldEventTracksApi }
export type GetWorldEventTracksApiResponse = /** status 200  */ {
	worldId: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	position: number
	visible: boolean
}[]
export type GetWorldEventTracksApiArg = {
	/** Any string value */
	worldId: string
}
export type CreateWorldEventTrackApiResponse = /** status 200  */ {
	id: string
}
export type CreateWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	body: {
		name: string
		position?: number
		assignOrphans: boolean
	}
}
export type UpdateWorldEventTrackApiResponse = /** status 200  */ {
	id: string
}
export type UpdateWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	trackId: string
	body: {
		name?: string
		position?: number
		visible?: boolean
	}
}
export type DeleteWorldEventTrackApiResponse = unknown
export type DeleteWorldEventTrackApiArg = {
	/** Any string value */
	worldId: string
	/** Any string value */
	trackId: string
}
export type SwapWorldEventTracksApiResponse = unknown
export type SwapWorldEventTracksApiArg = {
	/** Any string value */
	worldId: string
	body: {
		trackA: string
		trackB: string
	}
}
export const {
	useGetWorldEventTracksQuery,
	useLazyGetWorldEventTracksQuery,
	useCreateWorldEventTrackMutation,
	useUpdateWorldEventTrackMutation,
	useDeleteWorldEventTrackMutation,
	useSwapWorldEventTracksMutation,
} = injectedRtkApi
