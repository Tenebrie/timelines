import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['adminUsers'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
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
export type AdminGetUsersApiResponse = /** status 200  */ {
	users: {
		id: string
		createdAt: string
		updatedAt: string
		email: string
		username: string
		bio: string
		level: 'Free' | 'Premium' | 'Admin'
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
export type AdminSetUserLevelApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminSetUserLevelApiArg = {
	/** Any string value with at least one character */
	userId: string
	body: {
		level: 'Free' | 'Premium' | 'Admin'
	}
}
export type AdminDeleteUserApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Free' | 'Premium' | 'Admin'
	avatarId?: null | string
}
export type AdminDeleteUserApiArg = {
	/** Any string value with at least one character */
	userId: string
}
export type AdminSetUserPasswordApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	deletedAt?: null | string
	email: string
	username: string
	password: string
	bio: string
	level: 'Free' | 'Premium' | 'Admin'
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
	useAdminGetUsersQuery,
	useLazyAdminGetUsersQuery,
	useAdminSetUserLevelMutation,
	useAdminDeleteUserMutation,
	useAdminSetUserPasswordMutation,
} = injectedRtkApi
