import { baseApi as api } from './baseApi'
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
			dismissAnnouncement: build.mutation<DismissAnnouncementApiResponse, DismissAnnouncementApiArg>({
				query: (queryArg) => ({ url: `/api/announcements/${queryArg.id}`, method: 'DELETE' }),
				invalidatesTags: ['announcementList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as announcementListApi }
export type GetAnnouncementsApiResponse = /** status 200  */ {
	description: string
	id: string
	title: string
	type: 'Info' | 'Welcome' | 'WorldShared'
	timestamp: string
	userId: string
	isUnread: boolean
}[]
export type GetAnnouncementsApiArg = void
export type DismissAnnouncementApiResponse = unknown
export type DismissAnnouncementApiArg = {
	/** Any string value */
	id: string
}
export const { useGetAnnouncementsQuery, useLazyGetAnnouncementsQuery, useDismissAnnouncementMutation } =
	injectedRtkApi
