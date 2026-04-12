import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['adminNotifications'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			adminBroadcastNotification: build.mutation<
				AdminBroadcastNotificationApiResponse,
				AdminBroadcastNotificationApiArg
			>({
				query: (queryArg) => ({
					url: `/api/admin/notifications/broadcast`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['adminNotifications'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as adminNotificationsApi }
export type AdminBroadcastNotificationApiResponse = /** status 200  */ {
	recipientCount: number
	mode: string
}
export type AdminBroadcastNotificationApiArg = {
	body: {
		title: string
		description: string
		fullRun?: boolean
	}
}
export const { useAdminBroadcastNotificationMutation } = injectedRtkApi
