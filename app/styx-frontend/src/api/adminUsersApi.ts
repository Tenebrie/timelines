import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['adminUsers'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			adminGetFeatureFlags: build.query<AdminGetFeatureFlagsApiResponse, AdminGetFeatureFlagsApiArg>({
				query: (queryArg) => ({ url: `/api/admin/feature-flags/${queryArg.userId}` }),
				providesTags: ['adminUsers'],
			}),
			adminSetFeatureFlag: build.mutation<AdminSetFeatureFlagApiResponse, AdminSetFeatureFlagApiArg>({
				query: (queryArg) => ({ url: `/api/admin/feature-flags`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['adminUsers'],
			}),
			adminGetDashboard: build.query<AdminGetDashboardApiResponse, AdminGetDashboardApiArg>({
				query: () => ({ url: `/api/admin/dashboard` }),
				providesTags: ['adminUsers'],
			}),
			adminGetAuditLogs: build.query<AdminGetAuditLogsApiResponse, AdminGetAuditLogsApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/audit`,
					params: {
						page: queryArg.page,
						size: queryArg.size,
						query: queryArg.query,
					},
				}),
				providesTags: ['adminUsers'],
			}),
			adminGetUsers: build.query<AdminGetUsersApiResponse, AdminGetUsersApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users`,
					params: {
						page: queryArg.page,
						size: queryArg.size,
						query: queryArg.query,
					},
				}),
				providesTags: ['adminUsers'],
			}),
			adminImpersonateUser: build.mutation<AdminImpersonateUserApiResponse, AdminImpersonateUserApiArg>({
				query: (queryArg) => ({ url: `/api/admin/user/${queryArg.userId}/impersonate`, method: 'POST' }),
				invalidatesTags: ['adminUsers'],
			}),
			adminSetUserLevel: build.mutation<AdminSetUserLevelApiResponse, AdminSetUserLevelApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users/${queryArg.userId}/level`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['adminUsers'],
			}),
			adminDeleteUser: build.mutation<AdminDeleteUserApiResponse, AdminDeleteUserApiArg>({
				query: (queryArg) => ({ url: `/api/admin/users/${queryArg.userId}`, method: 'DELETE' }),
				invalidatesTags: ['adminUsers'],
			}),
			adminUpdateUser: build.mutation<AdminUpdateUserApiResponse, AdminUpdateUserApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users/${queryArg.userId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['adminUsers'],
			}),
			adminSetUserPassword: build.mutation<AdminSetUserPasswordApiResponse, AdminSetUserPasswordApiArg>({
				query: (queryArg) => ({
					url: `/api/admin/users/${queryArg.userId}/password`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['adminUsers'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as adminUsersApi }
export type AdminGetFeatureFlagsApiResponse = /** status 200  */ 'MindmapRework'[]
export type AdminGetFeatureFlagsApiArg = {
	userId: string
}
export type AdminSetFeatureFlagApiResponse = unknown
export type AdminSetFeatureFlagApiArg = {
	body: {
		flag: 'MindmapRework'
		userId: string
		enable: boolean
	}
}
export type AdminGetDashboardApiResponse = /** status 200  */ {
	auditStats: {
		guestAccountsCreated: number
		userAccountsCreated: number
		passwordLogins: number
		googleLogins: number
		failedLogins: number
		accountsDeleted: number
		adminImpersonations: number
		uniqueUserLogins: number
		totalEvents: number
	}
	fileSystemStats: {
		root: {
			free: number
			total: number
			summary: string
		}
		database: {
			free: number
			total: number
			summary: string
		}
	}
	dailyActiveUsers: number
	weeklyActiveUsers: number
	monthlyActiveUsers: number
}
export type AdminGetDashboardApiArg = void
export type AdminGetAuditLogsApiResponse = /** status 200  */ {
	logs: {
		data: string
		id: string
		createdAt: string
		requestIp: string
		userEmail?: null | string
		action:
			| 'UserCreateAccount'
			| 'UserLoginWithPassword'
			| 'UserLoginWithGoogle'
			| 'UserLoginFailed'
			| 'UserDeleteAccount'
			| 'UserExportData'
			| 'UserExportDataFailed'
			| 'UserValidateImportData'
			| 'UserValidateImportDataFailed'
			| 'UserImportData'
			| 'UserImportDataFailed'
			| 'GuestCreateAccount'
			| 'AdminImpersonateUser'
			| 'AdminUpdateUser'
			| 'AdminSetUserLevel'
			| 'AdminSetUserPassword'
			| 'AdminDeleteUser'
			| 'AdminBroadcastNotification'
	}[]
	page: number
	size: number
	pageCount: number
}
export type AdminGetAuditLogsApiArg = {
	/** Any numeric value */
	page?: number
	/** Any numeric value */
	size?: number
	/** Any string value */
	query?: string
}
export type AdminGetUsersApiResponse = /** status 200  */ {
	users: {
		featureFlags: 'MindmapRework'[]
		id: string
		createdAt: string
		updatedAt: string
		email: string
		username: string
		bio: string
		level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	}[]
	page: number
	size: number
	pageCount: number
}
export type AdminGetUsersApiArg = {
	/** Any numeric value */
	page?: number
	/** Any numeric value */
	size?: number
	/** Any string value */
	query?: string
}
export type AdminImpersonateUserApiResponse = /** status 200  */ {
	user: {
		id: string
		createdAt: string
		updatedAt: string
		deletedAt?: null | string
		deletionScheduledAt?: null | string
		email: string
		username: string
		password: string
		bio: string
		level: 'Guest' | 'Free' | 'Premium' | 'Admin'
		avatarId?: null | string
	}
}
export type AdminImpersonateUserApiArg = {
	/** Any string value with at least one character */
	userId: string
}
export type AdminSetUserLevelApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	deletionScheduledAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminSetUserLevelApiArg = {
	/** Any string value with at least one character */
	userId: string
	body: {
		level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	}
}
export type AdminDeleteUserApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	deletionScheduledAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminDeleteUserApiArg = {
	/** Any string value with at least one character */
	userId: string
}
export type AdminUpdateUserApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	deletionScheduledAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminUpdateUserApiArg = {
	/** Any string value with at least one character */
	userId: string
	body: {
		email?: string
		username?: string
		bio?: string
	}
}
export type AdminSetUserPasswordApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	deletionScheduledAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Guest' | 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminSetUserPasswordApiArg = {
	/** Any string value with at least one character */
	userId: string
	body: {
		password: string
	}
}
export const {
	useAdminGetFeatureFlagsQuery,
	useLazyAdminGetFeatureFlagsQuery,
	useAdminSetFeatureFlagMutation,
	useAdminGetDashboardQuery,
	useLazyAdminGetDashboardQuery,
	useAdminGetAuditLogsQuery,
	useLazyAdminGetAuditLogsQuery,
	useAdminGetUsersQuery,
	useLazyAdminGetUsersQuery,
	useAdminImpersonateUserMutation,
	useAdminSetUserLevelMutation,
	useAdminDeleteUserMutation,
	useAdminUpdateUserMutation,
	useAdminSetUserPasswordMutation,
} = injectedRtkApi
