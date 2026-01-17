import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['favoriteIcons'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFavoriteIcons: build.query<GetFavoriteIconsApiResponse, GetFavoriteIconsApiArg>({
				query: () => ({ url: `/api/icons/favorites` }),
				providesTags: ['favoriteIcons'],
			}),
			addFavoriteIcon: build.mutation<AddFavoriteIconApiResponse, AddFavoriteIconApiArg>({
				query: (queryArg) => ({ url: `/api/icons/favorites/${queryArg.iconId}`, method: 'POST' }),
				invalidatesTags: ['favoriteIcons'],
			}),
			removeFavoriteIcon: build.mutation<RemoveFavoriteIconApiResponse, RemoveFavoriteIconApiArg>({
				query: (queryArg) => ({ url: `/api/icons/favorites/${queryArg.iconId}`, method: 'DELETE' }),
				invalidatesTags: ['favoriteIcons'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as favoriteIconsApi }
export type GetFavoriteIconsApiResponse = /** status 200  */ {
	iconSets: {
		id: string
		name: string
		icons: string[]
		count: number
		procedural: boolean
	}[]
}
export type GetFavoriteIconsApiArg = void
export type AddFavoriteIconApiResponse = unknown
export type AddFavoriteIconApiArg = {
	/** Any string value with at least one character */
	iconId: string
}
export type RemoveFavoriteIconApiResponse = unknown
export type RemoveFavoriteIconApiArg = {
	/** Any string value with at least one character */
	iconId: string
}
export const {
	useGetFavoriteIconsQuery,
	useLazyGetFavoriteIconsQuery,
	useAddFavoriteIconMutation,
	useRemoveFavoriteIconMutation,
} = injectedRtkApi
