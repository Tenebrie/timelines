import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['announcementList'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAnnouncements: build.query<GetAnnouncementsApiResponse, GetAnnouncementsApiArg>({
				query: () => ({ url: `/api/announcements` }),
				providesTags: ['announcementList'],
			}),
			dismissAllAnnouncements: build.mutation<
				DismissAllAnnouncementsApiResponse,
				DismissAllAnnouncementsApiArg
			>({
				query: () => ({ url: `/api/announcements`, method: 'DELETE' }),
				invalidatesTags: ['announcementList'],
			}),
			dismissAnnouncement: build.mutation<DismissAnnouncementApiResponse, DismissAnnouncementApiArg>({
				query: (queryArg) => ({ url: `/api/announcements/${queryArg.id}`, method: 'DELETE' }),
				invalidatesTags: ['announcementList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as announcementListApi }
export type GetAnnouncementsApiResponse = /** status 200  */ {
	type: 'Info' | 'Welcome' | 'WorldShared'
	userId: string
	title: string
	description: string
	id: string
	timestamp: string
	isUnread: boolean
}[]
export type GetAnnouncementsApiArg = void
export type DismissAllAnnouncementsApiResponse = unknown
export type DismissAllAnnouncementsApiArg = void
export type DismissAnnouncementApiResponse = unknown
export type DismissAnnouncementApiArg = {
	/** Any string value */
	id: string
}
export const {
	useGetAnnouncementsQuery,
	useLazyGetAnnouncementsQuery,
	useDismissAllAnnouncementsMutation,
	useDismissAnnouncementMutation,
} = injectedRtkApi
