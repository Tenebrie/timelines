import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['auth', 'worldList', 'worldDetails', 'announcementList', 'adminUsers'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			checkAuthentication: build.query<CheckAuthenticationApiResponse, CheckAuthenticationApiArg>({
				query: () => ({ url: `/api/auth` }),
				providesTags: ['auth'],
			}),
			createAccount: build.mutation<CreateAccountApiResponse, CreateAccountApiArg>({
				query: (queryArg) => ({ url: `/api/auth`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
			deleteAccount: build.mutation<DeleteAccountApiResponse, DeleteAccountApiArg>({
				query: () => ({ url: `/api/auth`, method: 'DELETE' }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
			postLogin: build.mutation<PostLoginApiResponse, PostLoginApiArg>({
				query: (queryArg) => ({ url: `/api/auth/login`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList', 'adminUsers'],
			}),
			postLogout: build.mutation<PostLogoutApiResponse, PostLogoutApiArg>({
				query: () => ({ url: `/api/auth/logout`, method: 'POST' }),
				invalidatesTags: ['auth', 'worldList', 'worldDetails', 'announcementList'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as authApi }
export type CheckAuthenticationApiResponse =
	/** status 200  */
	| {
			authenticated: boolean
			sessionId: string
	  }
	| {
			authenticated: boolean
			sessionId: string
			user: {
				id: string
				email: string
				username: string
				level: 'Free' | 'Premium' | 'Admin'
				bio: string
				avatarUrl?: string
			}
	  }
export type CheckAuthenticationApiArg = void
export type CreateAccountApiResponse = /** status 200  */ {
	user: {
		avatarUrl?: string
		id: string
		email: string
		username: string
		bio: string
		level: 'Free' | 'Premium' | 'Admin'
	}
	sessionId: string
}
export type CreateAccountApiArg = {
	body: {
		email: string
		username: string
		password: string
	}
}
export type DeleteAccountApiResponse = unknown
export type DeleteAccountApiArg = void
export type PostLoginApiResponse = /** status 200  */ {
	user: {
		avatarUrl?: string
		id: string
		email: string
		username: string
		bio: string
		level: 'Free' | 'Premium' | 'Admin'
		avatar: null | {
			id: string
			createdAt: string
			updatedAt: string
			expiresAt?: null | string
			ownerId: string
			bucketKey: string
			size: number
			originalFileName: string
			originalFileExtension: string
			contentType: 'ImageConversion' | 'Avatar'
			status: 'Pending' | 'Finalized' | 'Failed'
		}
	}
	sessionId: string
}
export type PostLoginApiArg = {
	body: {
		email: string
		password: string
	}
}
export type PostLogoutApiResponse = unknown
export type PostLogoutApiArg = void
export const {
	useCheckAuthenticationQuery,
	useLazyCheckAuthenticationQuery,
	useCreateAccountMutation,
	useDeleteAccountMutation,
	usePostLoginMutation,
	usePostLogoutMutation,
} = injectedRtkApi
