import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['profile'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getStorageStatus: build.query<GetStorageStatusApiResponse, GetStorageStatusApiArg>({
				query: () => ({ url: `/api/profile/storage` }),
				providesTags: ['profile'],
			}),
			updateProfile: build.mutation<UpdateProfileApiResponse, UpdateProfileApiArg>({
				query: (queryArg) => ({ url: `/api/profile`, method: 'PATCH', body: queryArg.body }),
				invalidatesTags: ['profile'],
			}),
			postAvatar: build.mutation<PostAvatarApiResponse, PostAvatarApiArg>({
				query: (queryArg) => ({ url: `/api/profile/avatar`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['profile'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as profileApi }
export type GetStorageStatusApiResponse = /** status 200  */ {
	quota: {
		remaining: number
		used: number
		total: number
	}
}
export type GetStorageStatusApiArg = void
export type UpdateProfileApiResponse = /** status 200  */ {
	user: {
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
}
export type UpdateProfileApiArg = {
	body: {
		username: string
		bio: string
	}
}
export type PostAvatarApiResponse = /** status 200  */ {
	avatar: {
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
}
export type PostAvatarApiArg = {
	body: {
		assetId: string
	}
}
export const {
	useGetStorageStatusQuery,
	useLazyGetStorageStatusQuery,
	useUpdateProfileMutation,
	usePostAvatarMutation,
} = injectedRtkApi
