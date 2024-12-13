import { baseApi as api } from './baseApi'
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
	email: string
	username: string
	password: string
	level: 'Free' | 'Premium' | 'Admin'
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
	email: string
	username: string
	password: string
	level: 'Free' | 'Premium' | 'Admin'
}
export type AdminDeleteUserApiArg = {
	/** Any string value with at least one character */
	userId: string
}
export const {
	useAdminGetUsersQuery,
	useLazyAdminGetUsersQuery,
	useAdminSetUserLevelMutation,
	useAdminDeleteUserMutation,
} = injectedRtkApi
